import { useEffect, useState } from 'react';
import api from '../services/api';
import { TopAppBar } from '../components';

export default function ActivityPage({ user, onOpenCreateActivity, onOpenCreateQr, onOpenMonitor }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [registeringIds, setRegisteringIds] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data.data || []);
    } catch (error) {
      setMessage('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const registerActivity = async (activityId) => {
    if (registeringIds.includes(activityId) || registeredIds.includes(activityId)) {
      return;
    }

    setRegisteringIds((prev) => [...prev, activityId]);

    try {
      await api.post(`/activities/${activityId}/register`);
      setMessage('Đăng ký thành công');
      setRegisteredIds((prev) => (prev.includes(activityId) ? prev : [...prev, activityId]));
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage('Bạn đã đăng ký hoạt động này');
        setRegisteredIds((prev) => (prev.includes(activityId) ? prev : [...prev, activityId]));
        return;
      }

      setMessage('Đăng ký thất bại');
    } finally {
      setRegisteringIds((prev) => prev.filter((id) => id !== activityId));
    }
  };

  return (
    <div>
      <TopAppBar title="Hoạt động" />
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        <section className="mb-6 p-6 bg-primary-container rounded-xl text-on-primary">
          <p className="text-sm opacity-90">Xin chào</p>
          <h2 className="font-headline text-2xl font-bold">{user?.student_code || 'Sinh viên'}</h2>
        </section>

        {user?.role === 'admin' ? (
          <section className="mb-8 flex gap-3 flex-wrap">
            <button onClick={onOpenCreateActivity} className="px-5 py-3 bg-primary text-on-primary rounded-full font-semibold" type="button">
              Tạo hoạt động
            </button>
            <button onClick={onOpenCreateQr} className="px-5 py-3 bg-secondary-container text-on-secondary-container rounded-full font-semibold" type="button">
              Tạo mã QR
            </button>
          </section>
        ) : null}

        {message ? <p className="mb-4 text-sm text-primary">{message}</p> : null}

        {loading ? (
          <p>Đang tải danh sách...</p>
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
                  <span className="text-primary font-bold">+{item.points} Điểm</span>
                  {user?.role === 'admin' ? null : (
                    <button
                      onClick={() => registerActivity(item.id)}
                      disabled={registeringIds.includes(item.id) || registeredIds.includes(item.id)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold"
                      type="button"
                    >
                      {registeredIds.includes(item.id)
                        ? 'Đã đăng ký'
                        : registeringIds.includes(item.id)
                          ? 'Đang đăng ký...'
                          : 'Đăng ký'}
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
