import { useState } from 'react';
import api from '../services/api';

export default function QrScanPage({ onClose }) {
  const [token, setToken] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getLocation = () => {
    if (!navigator.geolocation) {
      setHasLocation(false);
      setMessage('Trinh duyet khong ho tro GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setHasLocation(true);
        setMessage('Da lay vi tri');
      },
      () => {
        setHasLocation(false);
        setMessage('Khong lay duoc vi tri, se gui pending');
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/attendance/scan', {
        token,
        lat: lat || null,
        lng: lng || null,
        has_location: hasLocation,
      });
      const status = response.data.data?.attendance?.status;
      setMessage(`Diem danh thanh cong - status: ${status}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Scan that bai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-10 pb-24 px-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold">Quet QR diem danh</h1>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-surface-container-low">Dong</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface-container-lowest p-6 rounded-xl">
        <input
          className="w-full px-4 py-3 bg-surface-container-low rounded-xl"
          placeholder="Nhap token QR"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <button type="button" onClick={getLocation} className="w-full px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container font-semibold">
          Lay vi tri GPS
        </button>

        <div className="grid grid-cols-2 gap-3">
          <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
          <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hasLocation} onChange={(e) => setHasLocation(e.target.checked)} />
          has_location
        </label>

        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-on-primary rounded-full font-bold">
          {loading ? 'Dang gui...' : 'Gui diem danh'}
        </button>

        {message ? <p className="text-sm text-primary">{message}</p> : null}
      </form>
    </main>
  );
}
