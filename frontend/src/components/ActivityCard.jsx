import React from 'react';

const DEFAULT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW-z9DWtzK_alEgry37mBOdIpfA3W307QuXcvB2eLOxN1txcAKnTYC5ISKyFDm70365-aUSTspzqPQIemCS78BJK0BPTD5OPLePIC1DbuW3JvHO_7koOMWGXBde6fzyi3Y0jOsrhdWJoa4IDNDQwbd4G1u0GEvHNaITF9Q5WSEtYzqCkzAOODXUBGf2sx_82HPd0pqx1PV1OhY55hsNPgexlhTxw_Uujj83mv-zAT3TyJy1qC7v5UtRAAXHgQP04ytnSyflfdtoXk';

export default function ActivityCard({
  activity,
  isRegistered,
  isRegistering,
  onRegister,
  isAdmin,
  index
}) {
  const isLarge = index !== undefined && (index + 1) % 3 === 0;

  const date = new Date(activity.start_time);
  const formattedDate = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`group bg-surface-container-lowest rounded-xl overflow-hidden editorial-shadow flex flex-col ${isLarge ? 'md:col-span-2 md:flex-row' : ''}`}>
      <div className={`relative ${isLarge ? 'h-48 md:h-auto md:w-2/5' : 'h-48 w-full'}`}>
        <img
          alt={activity.title}
          className="w-full h-full object-cover"
          src={activity.image_url || DEFAULT_IMAGE}
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-primary">
          {activity.category || 'Tất cả'}
        </div>
      </div>
      <div className={`flex-grow flex flex-col justify-between ${isLarge ? 'p-8' : 'p-6'}`}>
        <div>
          <h4 className={`font-headline font-bold text-on-surface mb-4 ${isLarge ? 'text-2xl' : 'text-xl'}`}>{activity.title}</h4>
          {isLarge && activity.description && (
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              {activity.description}
            </p>
          )}
          <div className={`${isLarge ? 'grid grid-cols-2 gap-4' : 'space-y-2'} mb-6`}>
             <div className="flex items-center gap-3 text-on-surface-variant text-sm">
               <span className="material-symbols-outlined text-lg">calendar_today</span>
               <span>{formattedDate} • {formattedTime}</span>
             </div>
             <div className="flex items-center gap-3 text-on-surface-variant text-sm mt-2 md:mt-0">
               <span className="material-symbols-outlined text-lg">location_on</span>
               <span>{activity.location_text || 'Chưa cập nhật location'}</span>
             </div>
          </div>
          <div className="mb-6 flex items-center gap-3 text-primary text-sm font-bold">
              <span className="material-symbols-outlined text-lg">stars</span>
              <span>+{activity.points} Điểm</span>
          </div>
        </div>

        {!isAdmin && (
          <button
            onClick={() => onRegister(activity.id)}
            disabled={isRegistered || isRegistering}
            className={`w-full py-3 rounded-full font-label font-bold text-sm transition-all active:scale-[0.98] ${
              isLarge ? 'md:w-max px-12' : ''
            } ${
              isRegistered
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-primary text-white hover:bg-primary-container'
            }`}
          >
            {isRegistered ? 'Đã đăng ký' : isRegistering ? 'Đang đăng ký...' : 'Tham gia'}
          </button>
        )}
      </div>
    </div>
  );
}
