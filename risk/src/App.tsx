import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { SetupWizard } from './components/settings/SetupWizard';
import { Dashboard } from './pages/Dashboard';
import { Trades } from './pages/Trades';
import { Goals } from './pages/Goals';
import { Analysis } from './pages/Analysis';
import { Reports } from './pages/Reports';
import { Risk } from './pages/Risk';
import { Settings } from './pages/Settings';
import { Backup } from './pages/Backup';
import { Notifications } from './pages/Notifications';
import { TradeForm } from './components/trades/TradeForm';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const {
    isSetupComplete,
    currentPage,
    theme,
    showAddTradeModal,
    showEditTradeModal,
    selectedTrade,
    setShowAddTradeModal,
    setShowEditTradeModal,
  } = useStore();

  // Apply theme on mount and change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'trades': return <Trades />;
      case 'goals': return <Goals />;
      case 'analysis': return <Analysis />;
      case 'reports': return <Reports />;
      case 'risk': return <Risk />;
      case 'settings': return <Settings />;
      case 'backup': return <Backup />;
      case 'notifications': return <Notifications />;
      default: return <Dashboard />;
    }
  };

  // Show setup wizard if not completed
  if (!isSetupComplete) {
    return (
      <>
        <SetupWizard />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              direction: 'rtl',
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            },
          }}
        />
      </>
    );
  }

  return (
    <Layout>
      {renderPage()}

      {/* Add Trade Modal */}
      <TradeForm
        isOpen={showAddTradeModal}
        onClose={() => setShowAddTradeModal(false)}
        mode="add"
      />

      {/* Edit Trade Modal */}
      <TradeForm
        isOpen={showEditTradeModal}
        onClose={() => setShowEditTradeModal(false)}
        trade={selectedTrade}
        mode="edit"
      />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            direction: 'rtl',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          },
        }}
      />
    </Layout>
  );
};

export default App;
