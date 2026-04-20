import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import { TopAppBar } from '../components';

ChartJS.register(ArcElement, Tooltip, Legend);

const PIE_COLORS = [
  '#2E7D32', '#1565C0', '#6A1B9A', '#E65100', '#00838F', '#78909C',
];

export default function PointsPage() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [statsActivities, setStatsActivities] = useState([]);
  const [historyActivities, setHistoryActivities] = useState([]);
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState(false);

  const parseFilename = (contentDisposition) => {
    if (!contentDisposition) return 'certificate.pdf';
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (filenameMatch?.[1]) return filenameMatch[1];
    return 'certificate.pdf';
  };

  const parseBlobErrorMessage = async (blob) => {
    if (!(blob instanceof Blob)) return '';
    try {
      const text = await blob.text();
      const data = JSON.parse(text);
      return String(data?.message || '').trim();
    } catch {
      return '';
    }
  };

  const exportCertificate = async () => {
    if (exporting) return;
    setExporting(true);
    setMessage('');
    try {
      const response = await api.get('/me/certificate', { responseType: 'blob' });
      const contentType = String(response?.headers?.['content-type'] || '').toLowerCase();
      if (!contentType.includes('application/pdf')) throw new Error('invalid_pdf_response');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const filename = parseFilename(response?.headers?.['content-disposition']);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      setMessage('Đã tải chứng chỉ PDF');
    } catch (error) {
      const backendMessage = await parseBlobErrorMessage(error?.response?.data);
      setMessage(backendMessage || 'Không thể xuất chứng chỉ PDF');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    Promise.all([api.get('/me/points'), api.get('/me/stats'), api.get('/me/activities')])
      .then(([pointsRes, statsRes, activitiesRes]) => {
        const backendTotal = Number(pointsRes?.data?.data?.total_points || 0);
        setTotalPoints(Number.isFinite(backendTotal) ? backendTotal : 0);
        const statsItems = Array.isArray(statsRes?.data?.data?.activities) ? statsRes.data.data.activities : [];
        setStatsActivities(statsItems);
        const historyItems = Array.isArray(activitiesRes?.data?.data) ? activitiesRes.data.data : [];
        setHistoryActivities(historyItems);
      })
      .catch(() => {
        setMessage('Không thể tải điểm');
      });
  }, []);

  // Build pie chart data: top 5 + "Khác"
  const buildPieData = () => {
    if (statsActivities.length === 0) return null;

    const sorted = [...statsActivities].sort((a, b) => Number(b.points) - Number(a.points));
    let labels = [];
    let data = [];

    if (sorted.length <= 5) {
      labels = sorted.map((a) => a.title);
      data = sorted.map((a) => Number(a.points));
    } else {
      const top5 = sorted.slice(0, 5);
      const rest = sorted.slice(5);
      const restSum = rest.reduce((sum, a) => sum + Number(a.points), 0);
      labels = [...top5.map((a) => a.title), 'Khác'];
      data = [...top5.map((a) => Number(a.points)), restSum];
    }

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: PIE_COLORS.slice(0, labels.length),
        borderWidth: 1,
        borderColor: '#fff',
      }],
    };
  };

  const pieData = buildPieData();

  return (
    <div>
      <TopAppBar title="Điểm tích luỹ" />
      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-6">
        <section className="bg-primary-container rounded-xl p-6 text-on-primary">
          <p className="text-sm">Tổng điểm hiện tại</p>
          <h2 className="font-headline text-5xl font-extrabold">{totalPoints}</h2>
        </section>

        <section className="flex justify-end">
          <button
            type="button"
            onClick={exportCertificate}
            disabled={exporting}
            className="px-5 py-3 bg-primary text-on-primary rounded-full font-semibold disabled:opacity-70"
          >
            {exporting ? 'Đang xuất PDF...' : 'Xuất PDF chứng chỉ'}
          </button>
        </section>

        {/* Pie Chart */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <h3 className="font-headline text-xl font-bold mb-4">Phân bố điểm theo hoạt động</h3>
          {pieData ? (
            <div className="max-w-xs mx-auto">
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } } }} />
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu</p>
          )}
        </section>

        {/* Activity Table */}
        <section className="space-y-3">
          <h3 className="font-headline text-xl font-bold">Lịch sử hoạt động</h3>
          {historyActivities.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Chưa có hoạt động nào được ghi nhận</p>
          ) : (
            historyActivities.map((item, index) => {
              let statusText = 'Đã đăng ký';
              let statusColor = 'text-on-surface-variant';
              if (item.status === 'approved') {
                statusText = 'Hoàn thành';
                statusColor = 'text-emerald-600';
              } else if (item.status === 'pending') {
                statusText = 'Chờ xác minh';
                statusColor = 'text-amber-600';
              } else if (item.status === 'rejected') {
                statusText = 'Từ chối';
                statusColor = 'text-red-600';
              }

              return (
                <article key={index} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.title || '-'}</p>
                    {item.status === 'approved' && (
                      <p className="font-bold text-primary">+{Number(item.points || 0)}</p>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${statusColor}`}>Trạng thái: {statusText}</p>
                </article>
              );
            })
          )}
        </section>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}
      </main>
    </div>
  );
}
