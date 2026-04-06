import { useEffect, useState } from 'react';
import api from '../services/api';
import { TopAppBar } from '../components';

export default function PointsPage() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([api.get('/me/points'), api.get('/me/activities')])
      .then(([pointsRes, activitiesRes]) => {
        setTotalPoints(pointsRes.data.data?.total_points || 0);
        setActivities(activitiesRes.data.data || []);
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || 'Cannot load points');
      });
  }, []);

  return (
    <div>
      <TopAppBar title="Diem tich luy" />
      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-6">
        <section className="bg-primary-container rounded-xl p-6 text-on-primary">
          <p className="text-sm">Tong diem hien tai</p>
          <h2 className="font-headline text-5xl font-extrabold">{totalPoints}</h2>
        </section>

        <section className="space-y-3">
          <h3 className="font-headline text-xl font-bold">Lich su hoat dong</h3>
          {activities.map((item) => (
            <article key={item.activity_id} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.title}</p>
                <p className="font-bold text-primary">+{item.points}</p>
              </div>
              <p className="text-sm text-on-surface-variant">Trang thai: {item.status}</p>
            </article>
          ))}
        </section>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}
      </main>
    </div>
  );
}
