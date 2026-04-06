import { TopAppBar } from '../components';

export default function AccountInfoPage({ user, onLogout }) {
  return (
    <div>
      <TopAppBar title="Tai khoan" />
      <main className="pt-24 pb-32 px-6 max-w-xl mx-auto space-y-6">
        <section className="editorial-gradient rounded-xl p-6 text-white">
          <h2 className="font-headline text-2xl font-bold mb-1">Tai khoan hien tai</h2>
          <p className="text-sm opacity-90">MSSV: {user?.student_code || '-'}</p>
          <p className="text-sm opacity-90">Role: {user?.role || '-'}</p>
        </section>

        <button
          type="button"
          className="w-full bg-error text-on-error py-4 rounded-full font-bold"
          onClick={onLogout}
        >
          Dang xuat
        </button>
      </main>
    </div>
  );
}
