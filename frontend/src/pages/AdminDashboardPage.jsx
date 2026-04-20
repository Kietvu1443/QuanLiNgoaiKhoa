import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import { TopAppBar } from '../components';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDashboardPage({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailStats, setDetailStats] = useState({});

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => {
        const items = Array.isArray(res.data?.data?.activities) ? res.data.data.activities : [];
        setActivities(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchDetailStats = async (activityId) => {
    if (detailStats[activityId]) return; // already cached
    try {
      const res = await api.get(`/admin/stats/activities/${activityId}/stats`);
      setDetailStats((prev) => ({ ...prev, [activityId]: res.data?.data || {} }));
    } catch {
      setDetailStats((prev) => ({ ...prev, [activityId]: { approved: 0, pending: 0, rejected: 0 } }));
    }
  };

  // Aggregate metrics
  const totalParticipants = activities.reduce((sum, a) => sum + (a.participants_count || 0), 0);
  const totalEvents = activities.length;
  const topEvent = activities.length > 0 ? activities[0] : null; // already sorted DESC from backend

  // Chart data
  const chartData = {
    labels: activities.map((a) => a.title),
    datasets: [{
      label: 'Số người tham gia (đã duyệt)',
      data: activities.map((a) => a.participants_count),
      backgroundColor: '#2E7D32',
      borderRadius: 6,
      maxBarThickness: 48,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div>
      <TopAppBar title="Thống kê quản trị" />
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <section className="flex justify-end">
          <button onClick={onBack} type="button" className="px-4 py-2 rounded-full bg-surface-container-low text-sm font-semibold">
            Quay lại
          </button>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-container rounded-xl p-5 text-on-primary">
            <p className="text-sm opacity-80">Tổng người tham gia</p>
            <h2 className="font-headline text-3xl font-extrabold">{totalParticipants}</h2>
          </div>
          <div className="bg-secondary-container rounded-xl p-5 text-on-secondary-container">
            <p className="text-sm opacity-80">Tổng sự kiện</p>
            <h2 className="font-headline text-3xl font-extrabold">{totalEvents}</h2>
          </div>
          <div className="bg-tertiary-container rounded-xl p-5 text-on-tertiary-container">
            <p className="text-sm opacity-80">Sự kiện đông nhất</p>
            <h2 className="font-headline text-lg font-extrabold truncate">
              {topEvent ? `${topEvent.title} (${topEvent.participants_count})` : '-'}
            </h2>
          </div>
        </section>

        {/* Bar Chart */}
        {loading ? (
          <p className="text-center py-10 text-on-surface-variant">Đang tải dữ liệu...</p>
        ) : activities.length === 0 ? (
          <p className="text-center py-10 text-on-surface-variant">Chưa có dữ liệu thống kê</p>
        ) : (
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <h3 className="font-headline text-xl font-bold mb-4">Hoạt động theo số người tham gia</h3>
            <Bar data={chartData} options={chartOptions} />
          </section>
        )}

        {/* Summary Table */}
        {activities.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-headline text-xl font-bold">Chi tiết hoạt động</h3>
            {activities.map((item) => {
              const detail = detailStats[item.id];
              const isExpanded = !!detail;

              return (
                <article
                  key={item.id}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors"
                  onClick={() => fetchDetailStats(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.title}</p>
                    <p className="font-bold text-primary">{item.participants_count} người</p>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 flex gap-4 text-xs text-on-surface-variant">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Đã duyệt: {detail.approved}</span>
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Chờ duyệt: {detail.pending}</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">Từ chối: {detail.rejected}</span>
                    </div>
                  )}
                  {!isExpanded && (
                    <p className="text-xs text-on-surface-variant mt-1">Nhấp để xem chi tiết</p>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
