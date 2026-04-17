import { useState } from 'react';
import api from '../services/api';

export default function CreateActivityPage({ onBack }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    start_time: '',
    end_time: '',
    points: 5,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/activities', form);
      setMessage('Tạo hoạt động thành công');
    } catch (error) {
      setMessage('Tạo hoạt động thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-10 pb-32 px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold">Tạo hoạt động</h1>
        <button onClick={onBack} type="button" className="px-4 py-2 rounded-full bg-surface-container-low">
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface-container-lowest p-6 rounded-xl">
        <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Tên hoạt động" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
        <textarea className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Mô tả" rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />

        <div className="grid md:grid-cols-2 gap-3">
          <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Vĩ độ" value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} />
          <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Kinh độ" value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input type="datetime-local" className="w-full px-4 py-3 bg-surface-container-low rounded-xl" value={form.start_time} onChange={(e) => updateField('start_time', e.target.value)} />
          <input type="datetime-local" className="w-full px-4 py-3 bg-surface-container-low rounded-xl" value={form.end_time} onChange={(e) => updateField('end_time', e.target.value)} />
        </div>

        <input type="number" min="0" className="w-full px-4 py-3 bg-surface-container-low rounded-xl" value={form.points} onChange={(e) => updateField('points', e.target.value)} />

        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-on-primary rounded-full font-bold">
          {loading ? 'Đang tạo...' : 'Tạo hoạt động'}
        </button>

        {message ? <p className="text-sm text-primary">{message}</p> : null}
      </form>
    </main>
  );
}
