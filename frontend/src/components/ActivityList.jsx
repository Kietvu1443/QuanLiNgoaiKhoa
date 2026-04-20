import React from 'react';
import ActivityCard from './ActivityCard';

export default function ActivityList({ activities, registeredIds, registeringIds, onRegister, isAdmin }) {
  if (activities.length === 0) {
    return <p className="text-on-surface-variant text-center my-10 font-medium">Không có hoạt động nào trong danh mục này.</p>;
  }

  return (
    <section className="space-y-8">
      <h3 className="font-headline text-2xl font-bold text-primary tracking-tight">Sắp tới</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isRegistered={registeredIds.includes(activity.id)}
            isRegistering={registeringIds.includes(activity.id)}
            onRegister={onRegister}
            isAdmin={isAdmin}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
