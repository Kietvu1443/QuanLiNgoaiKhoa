import { useRef, useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['Học thuật', 'Workshop', 'Tình nguyện', 'Thể thao'];

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
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      setMessageType('error');
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
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Tạo hoạt động thất bại');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high/50 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="text-xl font-headline font-bold tracking-tight text-primary">Tạo Hoạt động</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Image Upload Section */}
          <section className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-48 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer overflow-hidden ${
                imagePreview ? 'p-0 border-0' : 'bg-surface-container-low'
              }`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
                  <span className="font-label text-sm text-on-surface-variant font-medium">Tải ảnh bìa hoạt động</span>
                </>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-sm font-medium text-on-surface-variant">Đang tải ảnh lên...</span>
              </div>
            )}
          </section>

          {/* Basic Info */}
          <div className="space-y-6">
            {/* Activity Name */}
            <div className="group">
              <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Tên hoạt động</label>
              <input
                className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary transition-all py-2 outline-none text-on-surface placeholder:text-outline-variant font-medium"
                placeholder="Ví dụ: Workshop Kỹ năng Tư duy Thiết kế"
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Mô tả chi tiết</label>
              <textarea
                className="w-full bg-surface-container-low rounded-xl p-4 border-none focus:ring-1 focus:ring-primary transition-all text-on-surface placeholder:text-outline-variant resize-none"
                placeholder="Mô tả mục tiêu và nội dung hoạt động..."
                rows={3}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type Selection (Radio Pills) */}
              <div className="col-span-2">
                <label className="block font-headline text-primary font-bold text-sm mb-3 tracking-tight">Loại hoạt động</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={form.category === cat}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="hidden peer"
                      />
                      <span className="px-4 py-2 rounded-lg bg-secondary-fixed-dim text-on-secondary-fixed-variant peer-checked:bg-primary peer-checked:text-white transition-all text-xs font-semibold block">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="col-span-2 group">
                <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Địa điểm</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                  <input
                    className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary transition-all py-2 pl-8 outline-none text-on-surface placeholder:text-outline-variant font-medium"
                    placeholder="Hội trường A, Tầng 3..."
                    type="text"
                    value={form.location_text}
                    onChange={(e) => updateField('location_text', e.target.value)}
                  />
                </div>
              </div>

              {/* Latitude & Longitude */}
              <div className="col-span-1">
                <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Vĩ độ</label>
                <input
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2 border-none text-xs font-medium focus:ring-1 focus:ring-primary"
                  placeholder="10.7769"
                  type="text"
                  value={form.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Kinh độ</label>
                <input
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2 border-none text-xs font-medium focus:ring-1 focus:ring-primary"
                  placeholder="106.6951"
                  type="text"
                  value={form.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                />
              </div>

              {/* Time Selection */}
              <div className="col-span-1">
                <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Bắt đầu</label>
                <input
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2 border-none text-xs font-medium focus:ring-1 focus:ring-primary"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => updateField('start_time', e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <label className="block font-headline text-primary font-bold text-sm mb-2 tracking-tight">Kết thúc</label>
                <input
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2 border-none text-xs font-medium focus:ring-1 focus:ring-primary"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => updateField('end_time', e.target.value)}
                />
              </div>

              {/* Training Points */}
              <div className="col-span-2">
                <div className="bg-primary-fixed rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    <span className="font-headline font-bold text-on-primary-fixed">Điểm rèn luyện</span>
                  </div>
                  <input
                    className="w-16 bg-surface-container-lowest rounded-lg border-none text-center font-bold text-primary focus:ring-2 focus:ring-primary"
                    type="number"
                    min={0}
                    max={100}
                    value={form.points}
                    onChange={(e) => updateField('points', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 bg-primary text-white rounded-full font-headline font-bold text-lg shadow-lg hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Đang tạo...' : 'Tạo hoạt động'}</span>
              {!loading && <span className="material-symbols-outlined">rocket_launch</span>}
            </button>
            <p className="text-center text-outline text-xs mt-4 px-8 leading-relaxed">
              Hoạt động sẽ được gửi phê duyệt trước khi hiển thị công khai trên hệ thống.
            </p>
          </div>

          {/* Message feedback */}
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              messageType === 'success'
                ? 'bg-primary-fixed text-on-primary-fixed'
                : 'bg-error-container text-on-error-container'
            }`}>
              {message}
            </div>
          )}
        </form>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-primary-fixed blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-secondary-fixed blur-[100px] rounded-full"></div>
      </div>
    </>
  );
}
