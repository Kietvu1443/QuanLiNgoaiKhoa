import { useEffect, useState } from 'react';
import api from '../services/api';
import { TopAppBar } from '../components';

export default function ActivityPage({ user, onOpenCreateActivity, onOpenCreateQr }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const registerActivity = async (activityId) => {
    try {
      await api.post(`/activities/${activityId}/register`);
      setMessage('Dang ky thanh cong');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Dang ky that bai');
    }
  };

  return (
    <div>
      <TopAppBar title="Hoat dong" />
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        <section className="mb-6 p-6 bg-primary-container rounded-xl text-on-primary">
          <p className="text-sm opacity-90">Xin chao</p>
          <h2 className="font-headline text-2xl font-bold">{user?.student_code || 'student'}</h2>
        </section>

        {user?.role === 'admin' ? (
          <section className="mb-8 flex gap-3 flex-wrap">
            <button onClick={onOpenCreateActivity} className="px-5 py-3 bg-primary text-on-primary rounded-full font-semibold" type="button">
              Tao hoat dong
            </button>
            <button onClick={onOpenCreateQr} className="px-5 py-3 bg-secondary-container text-on-secondary-container rounded-full font-semibold" type="button">
              Tao QR
            </button>
          </section>
        ) : null}

        {message ? <p className="mb-4 text-sm text-primary">{message}</p> : null}

        {loading ? (
          <p>Dang tai danh sach...</p>
        ) : (
          <section className="grid gap-4">
            {activities.map((item) => (
              <article key={item.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm mb-4">{item.description}</p>
                <p className="text-xs text-on-surface-variant mb-4">
                  {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleString()}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">+{item.points} diem</span>
                  {user?.role === 'admin' ? null : (
                    <button
                      onClick={() => registerActivity(item.id)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold"
                      type="button"
                    >
                      Dang ky
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
