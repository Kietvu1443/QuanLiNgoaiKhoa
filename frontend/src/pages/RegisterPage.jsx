import { useState } from 'react';
import api from '../services/api';

export default function RegisterPage({ onRegisterSuccess, onGoLogin }) {
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: fullName.trim(),
        student_code: studentCode,
        password,
      });

      await api.post('/auth/login', {
        student_code: studentCode,
        password,
      }).then((response) => onRegisterSuccess(response.data.data));
    } catch (err) {
      setError('Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-surface min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-[2rem] p-8 md:p-12">
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Tạo tài khoản mới</h1>
        <p className="text-on-surface-variant mb-8">Đây là bản demo để kiểm thử chức năng.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Họ và tên</label>
            <input
              className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-surface-container-highest focus:border-primary outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Mã số sinh viên</label>
            <input
              className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-surface-container-highest focus:border-primary outline-none"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="sv002"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Mật khẩu</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-surface-container-highest focus:border-primary outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Nhập lại mật khẩu</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-surface-container-highest focus:border-primary outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline font-bold"
          >
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-8 text-sm text-on-surface-variant text-center">
          Đã có tài khoản?{' '}
          <button onClick={onGoLogin} type="button" className="text-primary font-bold hover:underline">
            Đăng nhập
          </button>
        </p>
      </div>
    </main>
  );
}
