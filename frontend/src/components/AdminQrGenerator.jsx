import { useState } from 'react';
import QRCode from 'react-qr-code';
import api from '../services/api';

export default function AdminQrGenerator() {
  const [activityId, setActivityId] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setToken('');

    if (!activityId) {
      setError('Vui lòng nhập mã hoạt động');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/qr/create', {
        activity_id: Number(activityId),
      });

      setToken(response.data.token || '');
    } catch (err) {
      setError('Tạo mã QR thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm space-y-4 p-4 bg-surface-container-lowest rounded-xl">
      <label className="block text-sm font-semibold text-on-surface">
        Mã hoạt động
      </label>

      <input
        type="number"
        value={activityId}
        onChange={(e) => setActivityId(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-surface-container-low"
        placeholder="Nhập mã hoạt động"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-primary text-on-primary font-semibold"
      >
        {loading ? 'Đang tạo...' : 'Tạo mã QR'}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {token ? (
        <div className="space-y-2">
          <QRCode value={token} size={180} />
          <p className="text-xs break-all text-on-surface-variant">{token}</p>
        </div>
      ) : null}
    </div>
  );
}
