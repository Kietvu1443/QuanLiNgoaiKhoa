import { useState } from 'react';
import api from '../services/api';

export default function LoginPage({ onLogin, onGoRegister }) {
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        student_code: studentCode,
        password,
      });

      onLogin(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-surface min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,52,43,0.08)]">
        <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">Chao mung tro lai</h1>
        <p className="text-on-surface-variant text-sm mb-8">Dang nhap de tiep tuc diem danh hoat dong.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2" htmlFor="student_code">
              Ma so sinh vien
            </label>
            <input
              id="student_code"
              className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-surface-container-highest focus:border-primary outline-none"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="sv001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2" htmlFor="password">
              Mat khau
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-surface-container-highest focus:border-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full"
          >
            {loading ? 'Dang dang nhap...' : 'Dang nhap'}
          </button>
        </form>

        <p className="mt-8 text-sm text-on-surface-variant text-center">
          Chua co tai khoan?{' '}
          <button onClick={onGoRegister} className="text-primary font-bold hover:underline" type="button">
            Dang ky
          </button>
        </p>
      </div>
    </main>
  );
}
