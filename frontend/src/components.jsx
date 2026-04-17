import React from 'react';

export const MaterialIcon = ({ icon, className = '', filled = false }) => (
  <span 
    className={`material-symbols-outlined ${className}`} 
    style={filled ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
    {icon}
  </span>
);

export const BottomNav = ({ currentTab, onChange }) => {
  const tabs = [
    { id: 'activity', icon: 'list_alt', label: 'Hoạt động' },
    { id: 'qr', icon: 'qr_code_scanner', label: 'Quét mã QR' },
    { id: 'points', icon: 'stars', label: 'Tích lũy' },
    { id: 'account', icon: 'account_circle', label: 'Tài khoản' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 backdrop-blur-2xl border-t border-slate-100 rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center justify-center px-5 py-2 mt-1 transition-transform duration-200 active:scale-90 ${
              isActive 
                ? 'bg-teal-900 text-white rounded-[16px]' 
                : 'text-slate-400 hover:text-teal-700'
            }`}
          >
            <MaterialIcon icon={tab.icon} filled={isActive} className="mb-1" />
            <span className="text-[10px] font-medium font-inter uppercase tracking-widest">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export const TopAppBar = ({ title, profileImg }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-[#f8faf7]/70 backdrop-blur-xl transition-all duration-300 ease-in-out border-none">
    <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        {profileImg && (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 transition-all duration-300 ease-in-out active:scale-95">
            <img alt="Ảnh đại diện" className="w-full h-full object-cover" src={profileImg} />
          </div>
        )}
        <h1 className="font-headline tracking-tight font-bold text-lg text-teal-900">{title}</h1>
      </div>
      <button className="w-10 h-10 flex items-center justify-center rounded-full text-teal-900 transition-all duration-300 ease-in-out active:scale-95 hover:bg-teal-50/50">
        <MaterialIcon icon="notifications" />
      </button>
    </div>
  </header>
);

export const ActivityPulse = () => (
  <div className="flex items-end gap-1.5 h-16">
    <div className="w-1.5 h-8 bg-primary-fixed-dim rounded-full"></div>
    <div className="w-1.5 h-12 bg-primary-fixed-dim rounded-full"></div>
    <div className="w-1.5 h-16 bg-white rounded-full"></div>
    <div className="w-1.5 h-10 bg-primary-fixed-dim rounded-full"></div>
    <div className="w-1.5 h-14 bg-primary-fixed-dim rounded-full"></div>
  </div>
);
