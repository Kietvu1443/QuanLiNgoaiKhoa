import { useEffect, useState } from "react";
import api from "../services/api";
import { TopAppBar, ActivityPulse } from "../components";
import CategoryFilter from "../components/CategoryFilter";
import ActivityList from "../components/ActivityList";

export default function ActivityPage({
  user,
  onOpenCreateActivity,
  onOpenCreateQr,
  onOpenMonitor,
  onOpenAdminDashboard,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [registeringIds, setRegisteringIds] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [categories, setCategories] = useState(["Tất cả"]);
  const [weeklyCount, setWeeklyCount] = useState(null);

  const fetchActivities = async () => {
    try {
      const response = await api.get("/activities");
      setActivities(response.data.data || []);
    } catch {
      setMessage("Không thể tải danh sách hoạt động");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/activities/categories");
      const serverCats = response.data.data || [];
      setCategories(["Tất cả", ...serverCats]);
    } catch {
      // Fallback: keep just 'Tất cả'
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const response = await api.get("/me/weekly-stats");
      setWeeklyCount(response.data.data?.activities_count ?? 0);
    } catch {
      setWeeklyCount(0);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchCategories();
    fetchWeeklyStats();
  }, []);

  const getWeeklyText = () => {
    if (weeklyCount === null) return "...";
    if (weeklyCount === 0) return "Chưa tham gia hoạt động nào";
    if (weeklyCount === 1) return "1 hoạt động";
    return `${weeklyCount} hoạt động`;
  };

  const registerActivity = async (activityId) => {
    if (
      registeringIds.includes(activityId) ||
      registeredIds.includes(activityId)
    ) {
      return;
    }

    setRegisteringIds((prev) => [...prev, activityId]);

    try {
      await api.post(`/activities/${activityId}/register`);
      setMessage("Đăng ký thành công");
      setRegisteredIds((prev) =>
        prev.includes(activityId) ? prev : [...prev, activityId],
      );
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage("Bạn đã đăng ký hoạt động này");
        setRegisteredIds((prev) =>
          prev.includes(activityId) ? prev : [...prev, activityId],
        );
        return;
      }

      setMessage("Đăng ký thất bại");
    } finally {
      setRegisteringIds((prev) => prev.filter((id) => id !== activityId));
    }
  };

  const filteredActivities =
    selectedCategory === "Tất cả"
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <TopAppBar
        title="Hoạt động"
        profileImg="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-z9DWtzK_alEgry37mBOdIpfA3W307QuXcvB2eLOxN1txcAKnTYC5ISKyFDm70365-aUSTspzqPQIemCS78BJK0BPTD5OPLePIC1DbuW3JvHO_7koOMWGXBde6fzyi3Y0jOsrhdWJoa4IDNDQwbd4G1u0GEvHNaITF9Q5WSEtYzqCkzAOODXUBGf2sx_82HPd0pqx1PV1OhY55hsNPgexlhTxw_Uujj83mv-zAT3TyJy1qC7v5UtRAAXHgQP04ytnSyflfdtoXk"
      />

      <main className="pt-20 pb-32 px-6 max-w-7xl mx-auto">
        {/* Admin controls */}
        {user?.role === "admin" && (
          <section className="mb-8 flex gap-3 flex-wrap">
            <button
              onClick={onOpenCreateActivity}
              className="px-5 py-3 bg-primary text-white rounded-full font-label font-bold text-sm shadow-sm hover:bg-primary-container transition-colors"
              type="button"
            >
              Tạo hoạt động
            </button>
            <button
              onClick={onOpenCreateQr}
              className="px-5 py-3 bg-secondary-container text-on-secondary-container rounded-full font-label font-bold text-sm shadow-sm transition-colors"
              type="button"
            >
              Tạo mã QR
            </button>
            <button
              onClick={onOpenMonitor}
              className="px-5 py-3 bg-tertiary text-on-tertiary rounded-full font-label font-bold text-sm shadow-sm transition-colors"
              type="button"
            >
              Xác minh điểm danh
            </button>
            <button
              onClick={onOpenAdminDashboard}
              className="px-5 py-3 bg-surface-container-low text-on-surface rounded-full font-label font-bold text-sm shadow-sm transition-colors"
              type="button"
            >
              Thống kê
            </button>
          </section>
        )}

        {message && (
          <div className="mb-6 p-4 bg-secondary-container text-on-secondary-container rounded-lg text-sm font-medium">
            {message}
          </div>
        )}

        {/* Hero Section: Stats Pulse */}
        <section className="mb-10">
          <div className="bg-primary-container p-6 rounded-xl text-on-primary-container flex justify-between items-end editorial-shadow">
            <div className="space-y-1">
              <p className="text-sm font-label uppercase tracking-widest text-primary-fixed-dim/80">
                Tiến độ tuần này
              </p>
              <h2 className="text-3xl font-headline font-extrabold text-white">
                {getWeeklyText()}
              </h2>
            </div>
            <ActivityPulse />
          </div>
        </section>

        {/* Category Filters */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20 text-on-surface-variant">
            <p>Đang tải danh sách...</p>
          </div>
        ) : (
          <ActivityList
            activities={filteredActivities}
            registeredIds={registeredIds}
            registeringIds={registeringIds}
            onRegister={registerActivity}
            isAdmin={user?.role === "admin"}
          />
        )}
      </main>
    </div>
  );
}
