import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import api from "../services/api";

export default function QrScanPage({ onClose }) {
  const scannerRef = useRef(null);
  const scanHandledRef = useRef(false);
  const closeTimerRef = useRef(null);
  const statusTimerRef = useRef(null);
  const stopPromiseRef = useRef(null);
  const isMountedRef = useRef(true);
  const isClosingRef = useRef(false);
  const deferredStopRef = useRef(null);

  const GPS_TIMEOUT_MS = 7000;
  const AUTO_CLOSE_DELAY_MS = 2200;
  const TOAST_HIDE_DELAY_MS = 3000;

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState(null);

  const scannerElementId = "qr-reader";
  const SCAN_FRAME_SIZE_PX = 250;

  const setScanningSafe = (value) => {
    if (isMountedRef.current) {
      setScanning(value);
    }
  };

  const stopAndClearScanner = async () => {
    if (stopPromiseRef.current) {
      return stopPromiseRef.current;
    }

    const scanner = scannerRef.current;
    if (!scanner) {
      setScanningSafe(false);
      return Promise.resolve();
    }

    stopPromiseRef.current = (async () => {
      try {
        const state = scanner.getState?.();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          await scanner.stop();
        }
      } catch {
        // Ignore stop errors when scanner is not in a stoppable state.
      }

      try {
        await scanner.clear();
      } catch {
        // Ignore clear errors during teardown.
      }

      scannerRef.current = null;
      setScanningSafe(false);
    })().finally(() => {
      stopPromiseRef.current = null;
    });

    return stopPromiseRef.current;
  };

  const showStatus = (type, text) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }

    if (isMountedRef.current) {
      setStatus({ type, text });
    }

    statusTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setStatus(null);
      }
      statusTimerRef.current = null;
    }, TOAST_HIDE_DELAY_MS);
  };

  useEffect(
    () => () => {
      isMountedRef.current = false;

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
        statusTimerRef.current = null;
      }

      if (deferredStopRef.current) {
        clearTimeout(deferredStopRef.current);
        deferredStopRef.current = null;
      }

      if (!isClosingRef.current && scannerRef.current) {
        void stopAndClearScanner();
      }
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
    isClosingRef.current = false;
    startScanner();
    // startScanner is intentionally called on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractToken = (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) return "";

    try {
      const url = new URL(value);
      const tokenFromQuery = url.searchParams.get("token");
      return tokenFromQuery ? tokenFromQuery.trim() : value;
    } catch {
      return value;
    }
  };

  const stopScanner = async () => {
    await stopAndClearScanner();
  };

  const resolveLocationForScan = () =>
    new Promise((resolve) => {
      if (hasLocation && lat && lng) {
        resolve({ lat, lng, hasLocation: true });
        return;
      }

      if (!navigator.geolocation) {
        resolve({ lat: null, lng: null, hasLocation: false });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLat = position.coords.latitude.toString();
          const nextLng = position.coords.longitude.toString();
          setLat(nextLat);
          setLng(nextLng);
          setHasLocation(true);
          resolve({
            lat: nextLat,
            lng: nextLng,
            hasLocation: true,
          });
        },
        () => {
          resolve({ lat: null, lng: null, hasLocation: false });
        },
        {
          enableHighAccuracy: true,
          timeout: GPS_TIMEOUT_MS,
        },
      );
    });

  const closeAfterDelay = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      handleClose();
    }, AUTO_CLOSE_DELAY_MS);
  };

  const resolveStatusType = (message, isSuccess) => {
    if (isSuccess) return "success";
    const lower = String(message || "").toLowerCase();
    if (
      lower.includes("vi tri") ||
      lower.includes("vị trí") ||
      lower.includes("xác minh") ||
      lower.includes("xac minh") ||
      lower.includes("pending") ||
      lower.includes("chờ xác minh")
    ) {
      return "warning";
    }
    return "error";
  };

  const mapStatusLabel = (value) => {
    const statusValue = String(value || "").toLowerCase();
    if (statusValue === "not_attended") return "Chưa điểm danh";
    if (statusValue === "pending") return "Chờ xác minh";
    if (statusValue === "success") return "Thành công";
    if (statusValue === "error") return "Lỗi";
    return value;
  };

  const localizeApiMessage = (value) => {
    const message = String(value || "").trim();
    if (!message) return "";

    const lower = message.toLowerCase();

    if (lower.includes("invalid token")) return "Mã QR không hợp lệ";
    if (lower.includes("expired")) return "Mã QR đã hết hạn";
    if (lower.includes("not registered"))
      return "Bạn chưa đăng ký hoạt động này";

    if (lower === "not_attended") return "Chưa điểm danh";
    if (lower === "pending") return "Chờ xác minh";
    if (lower === "success") return "Thành công";
    if (lower === "error") return "Lỗi";

    if (lower.includes("dang quet")) return "Đang quét";
    if (lower.includes("gui diem danh")) return "Gửi điểm danh";
    if (lower.includes("lay vi tri")) return "Lấy vị trí";
    if (lower.includes("dang diem danh")) return "Đang điểm danh";

    return message;
  };

  const isVietnameseText = (value) =>
    /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(
      String(value || ""),
    );

  const submitAttendance = async (
    nextToken,
    locationOverride,
    options = {},
  ) => {
    if (loading) return;

    const submitToken = String(nextToken || "").trim();
    if (!submitToken) {
      showStatus("error", "Mã QR không hợp lệ");
      return;
    }

    const shouldAutoClose = options.autoClose === true;

    setLoading(true);

    const nextLat = locationOverride?.lat ?? (lat || null);
    const nextLng = locationOverride?.lng ?? (lng || null);
    const nextHasLocation = locationOverride?.hasLocation ?? hasLocation;

    const payload = {
      token: submitToken,
      has_location: nextHasLocation,
    };

    if (nextHasLocation) {
      payload.lat = nextLat;
      payload.lng = nextLng;
    }

    try {
      const response = await api.post("/attendance/scan", payload);
      const status = response.data.data?.attendance?.status;
      const localizedStatus = mapStatusLabel(status);

      if (localizedStatus === "Chờ xác minh") {
        showStatus("warning", "Đã ghi nhận, chờ admin xác minh");
      } else {
        showStatus("success", "Điểm danh thành công");
      }

      if (shouldAutoClose) {
        closeAfterDelay();
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message || "";
      const localizedMessage = localizeApiMessage(apiMessage);
      const shouldUseLocalized =
        localizedMessage &&
        (localizedMessage !== apiMessage || isVietnameseText(localizedMessage));
      const fallbackMessage = shouldUseLocalized
        ? localizedMessage
        : "Có lỗi xảy ra, vui lòng thử lại";
      showStatus(resolveStatusType(fallbackMessage, false), fallbackMessage);

      if (shouldAutoClose) {
        closeAfterDelay();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (scanHandledRef.current || loading || isClosingRef.current) return;
    scanHandledRef.current = true;

    const scannedToken = extractToken(decodedText);
    setScanningSafe(false);
    void stopAndClearScanner();

    const location = await resolveLocationForScan();

    await submitAttendance(scannedToken, location, { autoClose: true });
  };

  const startScanner = async () => {
    if (scannerRef.current || scanning || loading || isClosingRef.current)
      return;

    scanHandledRef.current = false;

    const scanner = new Html5Qrcode(scannerElementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10 },
        handleScanSuccess,
        () => {},
      );
      setScanningSafe(true);
    } catch (error) {
      scannerRef.current = null;
      setScanningSafe(false);
      showStatus(
        "error",
        localizeApiMessage(error?.message) || "Không mở được camera",
      );
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setHasLocation(false);
      showStatus("warning", "Trình duyệt không hỗ trợ GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setHasLocation(true);
        showStatus("success", "Đã lấy vị trí");
      },
      () => {
        setHasLocation(false);
        showStatus("warning", "Đã ghi nhận, chờ admin xác minh");
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
      },
    );
  };

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }

    onClose();

    deferredStopRef.current = setTimeout(() => {
      void stopAndClearScanner();
      deferredStopRef.current = null;
    }, 0);
  };

  const statusClasses =
    status?.type === "success"
      ? "bg-green-600 text-white"
      : status?.type === "warning"
        ? "bg-yellow-400 text-black"
        : "bg-red-600 text-white";

  return (
    <main className="fixed inset-0 z-40 overflow-hidden bg-black text-white">
      <style>{`
        #qr-reader {
          width: 100%;
          height: 100%;
        }
        #qr-reader video,
        #qr-reader canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #qr-reader__dashboard,
        #qr-reader__header_message,
        #qr-shaded-region,
        .qr-shaded-region {
          display: none !important;
        }
      `}</style>

      <div id={scannerElementId} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-0 bg-black/55" />

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${SCAN_FRAME_SIZE_PX}px`,
            height: `${SCAN_FRAME_SIZE_PX}px`,
          }}
        >
          <div className="absolute inset-0 border border-white/30 bg-transparent" />

          <div className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-emerald-400" />
          <div className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-emerald-400" />
          <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-emerald-400" />
          <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-emerald-400" />
        </div>

        <div className="absolute left-1/2 top-[calc(50%+170px)] -translate-x-1/2 text-center text-sm font-medium text-white/95">
          Di chuyển camera đến mã QR để điểm danh
        </div>

        <div className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white">
          {loading
            ? "Đang điểm danh..."
            : scanning
              ? "Đang quét..."
              : "Đang mở camera..."}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="absolute left-5 top-5 z-20 h-10 w-10 rounded-full bg-black/65 text-lg font-bold text-white"
        aria-label="Đóng"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={getLocation}
        className={`absolute bottom-6 right-6 z-20 h-14 w-14 rounded-full text-2xl shadow-lg ${hasLocation ? "bg-emerald-500" : "bg-gray-500"}`}
        aria-label="Lấy vị trí"
      >
        📍
      </button>

      {status ? (
        <div
          className={`fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-semibold shadow-xl ${statusClasses}`}
        >
          {status.text}
        </div>
      ) : null}
    </main>
  );
}
