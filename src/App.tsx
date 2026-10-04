import React, { useState } from 'react';
import { EmulationProvider, useEmulation } from './context/EmulationContext';
import { Header } from './components/common/Header';
import { Sidebar, TabKey } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickScoringModal } from './components/quickScoring/QuickScoringModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { TeamView } from './components/teams/TeamView';
import { StudentListView } from './components/students/StudentListView';
import { CriteriaView } from './components/criteria/CriteriaView';
import { LogsHistoryView } from './components/logs/LogsHistoryView';
import { ClassReportView } from './components/report/ClassReportView';
import { SettingsAndGasView } from './components/settings/SettingsAndGasView';
import { LoginView } from './components/auth/LoginView';

const MainAppContent: React.FC = () => {
  const { isLoggedIn, currentUser } = useEmulation();
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // If not logged in, show the full login screen
  if (!isLoggedIn || !currentUser) {
    return <LoginView />;
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans text-slate-800 antialiased selection:bg-red-500 selection:text-white bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{ backgroundImage: `url('https://i.postimg.cc/8zqzKBbr/nen.png')` }}
    >
      {/* Soft translucent overlay for readability and contrast */}
      <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-[2px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10">
        <Header
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenLoginModal={() => setShowLoginModal(true)}
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && <DashboardView onNavigateTab={setCurrentTab} />}
          {currentTab === 'leaderboard' && <LeaderboardView />}
          {currentTab === 'teams' && <TeamView />}
          {currentTab === 'students' && <StudentListView />}
          {currentTab === 'criteria' && <CriteriaView />}
          {currentTab === 'logs' && <LogsHistoryView />}
          {currentTab === 'report' && <ClassReportView />}
          {currentTab === 'settings' && <SettingsAndGasView />}
          {currentTab === 'quick-score' && <LeaderboardView />}
        </main>
      </div>

      {/* Global Quick Scoring Modal */}
      <QuickScoringModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <EmulationProvider>
      <MainAppContent />
    </EmulationProvider>
  );
}
