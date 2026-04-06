import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CreateQrPage({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/activities')
      .then((response) => setActivities(response.data.data || []))
      .catch(() => setActivities([]));
  }, []);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setMessage('');

    try {
      const response = await api.post('/qr/generate', {
        activity_id: Number(activityId),
        duration_minutes: Number(durationMinutes),
      });
      setResult(response.data.data);
      setMessage('Tạo QR thành công');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Tạo QR thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-10 pb-32 px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold">Tạo mã QR</h1>
        <button onClick={onBack} type="button" className="px-4 py-2 rounded-full bg-surface-container-low">
          Quay lai
        </button>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4 bg-surface-container-lowest p-6 rounded-xl">
        <select
          className="w-full px-4 py-3 bg-surface-container-low rounded-xl"
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
        >
          <option value="">Chọn hoạt động</option>
          {activities.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          className="w-full px-4 py-3 bg-surface-container-low rounded-xl"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />

        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-on-primary rounded-full font-bold">
          {loading ? 'Đang tạo...' : 'Tạo QR'}
        </button>

        {message ? <p className="text-sm text-primary">{message}</p> : null}

        {result ? (
          <div className="bg-surface-container-low p-4 rounded-xl text-sm break-all">
            <p><strong>Token:</strong> {result.token}</p>
            <p><strong>Expires:</strong> {new Date(result.expires_at).toLocaleString()}</p>
          </div>
        ) : null}
      </form>
    </main>
  );
}
