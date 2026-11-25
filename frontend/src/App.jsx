import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { ExaminationsPage } from './pages/ExaminationsPage';
import { RoomsPage } from './pages/RoomsPage';
import { FacultyPage } from './pages/FacultyPage';
import { ConstraintsPage } from './pages/ConstraintsPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { TimetablePage } from './pages/TimetablePage';
import { ConflictsPage } from './pages/ConflictsPage';
import { PublishPage } from './pages/PublishPage';
import { dashboardApi } from './api/endpoints';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeConflicts, setActiveConflicts] = useState(0);

  const fetchGlobalMetrics = async () => {
    try {
      const res = await dashboardApi.getStats();
      setActiveConflicts(res.data?.hardConflicts || 0);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalMetrics();
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'students':
        return <StudentsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'examinations':
        return <ExaminationsPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'faculty':
        return <FacultyPage />;
      case 'constraints':
        return <ConstraintsPage />;
      case 'generator':
        return <GeneratorPage onNavigate={setActiveTab} />;
      case 'timetable':
        return <TimetablePage onNavigate={setActiveTab} />;
      case 'conflicts':
        return <ConflictsPage onNavigate={setActiveTab} />;
      case 'publish':
        return <PublishPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        conflictCount={activeConflicts}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onResetData={fetchGlobalMetrics} activeConflicts={activeConflicts} />
        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
