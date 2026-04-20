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
    location_text: '',
    category: 'Tình nguyện',
    image_url: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/activities/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateField('image_url', response.data.data.image_url);
    } catch (error) {
      const msg = error.response?.data?.message || 'Upload ảnh thất bại';
      setMessage(msg);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
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

        {/* Image upload */}
        <div>
          <label className="block text-sm font-label text-on-surface-variant mb-2">Ảnh hoạt động (tối đa 5MB, jpg/png/webp)</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
            className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-container"
          />
          {uploading && <p className="text-xs text-on-surface-variant mt-1">Đang tải ảnh lên...</p>}
          {imagePreview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-outline-variant">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            </div>
          )}
        </div>

        {/* Location text */}
        <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Địa điểm (ví dụ: Sảnh chính - Tòa A1)" value={form.location_text} onChange={(e) => updateField('location_text', e.target.value)} />

        {/* Category */}
        <select className="w-full px-4 py-3 bg-surface-container-low rounded-xl" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
          <option value="Tình nguyện">Tình nguyện</option>
          <option value="Học thuật">Học thuật</option>
          <option value="Thể thao">Thể thao</option>
          <option value="Nghệ thuật">Nghệ thuật</option>
        </select>

        <div className="grid md:grid-cols-2 gap-3">
          <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Vĩ độ" value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} />
          <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Kinh độ" value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input type="datetime-local" className="w-full px-4 py-3 bg-surface-container-low rounded-xl" value={form.start_time} onChange={(e) => updateField('start_time', e.target.value)} />
          <input type="datetime-local" className="w-full px-4 py-3 bg-surface-container-low rounded-xl" value={form.end_time} onChange={(e) => updateField('end_time', e.target.value)} />
        </div>

        <input type="number" min="0" className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Điểm tích lũy" value={form.points} onChange={(e) => updateField('points', e.target.value)} />

        <button type="submit" disabled={loading || uploading} className="w-full py-3 bg-primary text-on-primary rounded-full font-bold">
          {loading ? 'Đang tạo...' : 'Tạo hoạt động'}
        </button>

        {message ? <p className="text-sm text-primary">{message}</p> : null}
      </form>
    </main>
  );
}

