import { useEffect, useState } from 'react';
import api from '../services/api';
import { TopAppBar } from '../components';

export default function PointsPage() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState('');

  const normalizeStatus = (status) => status?.toLowerCase().trim() || '';

  const getPointValue = (item) => {
    const hasPointField = item?.point !== undefined && item?.point !== null && item?.point !== '';
    const primaryValue = hasPointField ? Number(item?.point || 0) : Number(item?.points || 0);
    return Number.isFinite(primaryValue) ? primaryValue : 0;
  };

  const mapStatusLabel = (status) => {
    const value = normalizeStatus(status);
    if (value === 'not_attended') return 'Chưa điểm danh';
    if (value === 'pending') return 'Chờ xác minh (chưa cộng điểm)';
    if (value === 'approved') return 'Hoàn thành';
    if (value === 'success') return 'Thành công';
    if (value === 'error') return 'Lỗi';
    if (value === 'rejected') return 'Từ Chối';
    return status || '-';
  };

  useEffect(() => {
    Promise.all([api.get('/me/points'), api.get('/me/activities')])
      .then(([pointsRes, activitiesRes]) => {
        const nextActivities = Array.isArray(activitiesRes?.data?.data) ? activitiesRes.data.data : [];
        const backendTotal = Number(pointsRes?.data?.data?.total_points || 0);
        setTotalPoints(Number.isFinite(backendTotal) ? backendTotal : 0);
        setActivities(nextActivities);
      })
      .catch(() => {
        setMessage('Không thể tải điểm');
      });
  }, []);

  return (
    <div>
      <TopAppBar title="Điểm tích luỹ" />
      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-6">
        <section className="bg-primary-container rounded-xl p-6 text-on-primary">
          <p className="text-sm">Tổng điểm hiện tại</p>
          <h2 className="font-headline text-5xl font-extrabold">{totalPoints}</h2>
        </section>

        <section className="space-y-3">
          <h3 className="font-headline text-xl font-bold">Lịch sử hoạt động</h3>
          {activities.map((item, index) => {
            const isApproved = normalizeStatus(item?.status) === 'approved';

            return (
            <article key={item?.activity_id ?? index} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item?.title || '-'}</p>
                <p className={`font-bold ${isApproved ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {isApproved ? `+${getPointValue(item)}` : '-'}
                </p>
              </div>
              <p className="text-sm text-on-surface-variant">Trạng thái: {mapStatusLabel(item.status)}</p>
            </article>
            );
          })}
        </section>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}
      </main>
    </div>
  );
}
