import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ActivityPage from './pages/ActivityPage';
import CreateActivityPage from './pages/CreateActivityPage';
import CreateQrPage from './pages/CreateQrPage';
import QrScanPage from './pages/QrScanPage';
import PointsPage from './pages/PointsPage';
import AccountInfoPage from './pages/AccountInfoPage';
import { BottomNav } from './components';

export default function App() {
  const [authView, setAuthView] = useState('login');
  const [currentTab, setCurrentTab] = useState('activity'); // activity, qr, points, account
  const [activityView, setActivityView] = useState('list');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (_error) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const isAuthenticated = Boolean(token);

  const handleLogin = ({ token: accessToken, user: userInfo }) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setCurrentTab('activity');
    setActivityView('list');
  };

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthView('register')}
      />
    ) : (
      <RegisterPage
        onRegisterSuccess={handleLogin}
        onGoLogin={() => setAuthView('login')}
      />
    );
  }

  const renderActivity = () => {
    if (activityView === 'create-activity') {
      return <CreateActivityPage onBack={() => setActivityView('list')} />;
    }

    if (activityView === 'create-qr') {
      return <CreateQrPage onBack={() => setActivityView('list')} />;
    }

    return (
      <ActivityPage
        user={user}
        onOpenCreateActivity={() => setActivityView('create-activity')}
        onOpenCreateQr={() => setActivityView('create-qr')}
      />
    );
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-24">
      {currentTab === 'activity' && renderActivity()}
      {currentTab === 'qr' && <QrScanPage onClose={() => setCurrentTab('activity')} />}
      {currentTab === 'points' && <PointsPage />}
      {currentTab === 'account' && <AccountInfoPage user={user} onLogout={handleLogout} />}

      {currentTab !== 'qr' && (
        <BottomNav
          currentTab={currentTab}
          onChange={(tab) => {
            setCurrentTab(tab);
            if (tab === 'activity') {
              setActivityView('list');
            }
          }}
        />
      )}
    </div>
  );
}
