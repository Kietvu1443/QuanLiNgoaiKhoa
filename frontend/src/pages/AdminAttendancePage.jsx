import { useEffect, useState } from 'react';
import api from '../services/api';
import { TopAppBar } from '../components';

function formatLocation(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return 'Không có GPS';
  }

  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

export default function AdminAttendancePage({ onBack }) {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  const fetchPendingAttendances = async () => {
    try {
      const response = await api.get('/admin/attendance/pending');
      setPendingItems(Array.isArray(response.data?.data) ? response.data.data : []);
      setMessage('');
    } catch {
      setMessage('Không thể tải danh sách chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAttendances();
  }, []);

  const handleAttendanceAction = async (attendanceId, action) => {
    setActioningId(attendanceId);

    try {
      await api.patch(`/admin/attendance/${attendanceId}/${action}`);
      setPendingItems((prev) => prev.filter((item) => item.id !== attendanceId));
      showToast('success', action === 'approve' ? 'Đã duyệt điểm danh' : 'Đã từ chối điểm danh');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Không thể xử lý điểm danh');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <TopAppBar title="Xác minh điểm danh" />

      <main className="pt-24 pb-32 px-6 max-w-6xl mx-auto space-y-5">
        <section className="rounded-xl bg-primary-container p-5 text-on-primary">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm opacity-90">Số lượt đang chờ duyệt</p>
              <h2 className="font-headline text-3xl font-bold">{pendingItems.length}</h2>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-on-primary/15 px-4 py-2 text-sm font-semibold"
            >
              Quay lại
            </button>
          </div>
        </section>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}

        {loading ? (
          <p>Đang tải danh sách chờ duyệt...</p>
        ) : pendingItems.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Hiện không có lượt điểm danh pending.</p>
        ) : (
          <section className="grid gap-4">
            {pendingItems.map((item) => {
              const isActioning = actioningId === item.id;

              return (
                <article key={item.id} className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-on-surface">Sinh viên: {item.student_code}</p>
                      <p className="text-sm text-on-surface-variant">Hoạt động: {item.activity_title}</p>
                      <p className="text-sm text-on-surface-variant">Vị trí: {formatLocation(item.latitude, item.longitude)}</p>
                      <p className="text-xs text-on-surface-variant">Thời gian quét: {formatDateTime(item.created_at)}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAttendanceAction(item.id, 'approve')}
                        disabled={isActioning}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        ✔ Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceAction(item.id, 'reject')}
                        disabled={isActioning}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {toast ? (
          <div
            className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toast.text}
          </div>
        ) : null}
      </main>
    </div>
  );
}
