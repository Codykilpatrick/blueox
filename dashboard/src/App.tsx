import { useState, useEffect } from 'react';
import { Briefcase, Users, Calendar, Clock, CheckCircle, Activity, HardHat, LogOut } from 'lucide-react';
import { useScheduleData } from './hooks/useScheduleData';
import { StatCard } from './components/StatCard';
import { PhaseChart } from './components/PhaseChart';
import { TimelineChart } from './components/TimelineChart';
import { CrewChart } from './components/CrewChart';
import { TaskTable } from './components/TaskTable';
import { Login } from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { data, loading, error, stats, chartData } = useScheduleData();

  // Check for existing auth on mount
  useEffect(() => {
    const auth = localStorage.getItem('blueox_auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('blueox_auth');
    setIsAuthenticated(false);
  };

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0f1a',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #1e3a5f',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        color: '#94a3b8',
        background: '#0a0f1a',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #1e3a5f',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p>Loading schedule data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        color: '#fb7185',
        background: '#0a0f1a',
      }}>
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  if (!stats || !chartData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        color: '#94a3b8',
        background: '#0a0f1a',
      }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Background effects */}
      <div className="bg-gradient" />
      <div className="bg-grid" />
      
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <HardHat size={32} />
            </div>
            <div>
              <h1>Blue Ox Enterprises</h1>
              <p className="subtitle">Company Schedule Dashboard</p>
            </div>
          </div>
          <div className="header-meta">
            <span className="update-badge">
              <Activity size={14} />
              Live Data
            </span>
            <span className="date-display">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Grid */}
        <section className="stats-grid">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            subtitle="Active projects"
            icon={Briefcase}
            color="#38bdf8"
            delay={1}
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            subtitle="Across all phases"
            icon={Calendar}
            color="#a78bfa"
            delay={2}
          />
          <StatCard
            title="Active Crews"
            value={stats.totalCrews}
            subtitle="Assigned personnel"
            icon={Users}
            color="#34d399"
            delay={3}
          />
          <StatCard
            title="Total Work"
            value={`${stats.totalWeeks}`}
            subtitle="Weeks scheduled"
            icon={Clock}
            color="#fbbf24"
            delay={4}
          />
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks}
            subtitle="Currently in progress"
            icon={Activity}
            color="#22d3ee"
            delay={5}
          />
          <StatCard
            title="Completed"
            value={stats.doneTasks}
            subtitle="Tasks finished"
            icon={CheckCircle}
            color="#4ade80"
            delay={6}
          />
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="charts-row">
            <PhaseChart data={chartData.phaseData} />
            <TimelineChart data={chartData.monthlyData} />
          </div>
          <div className="charts-row-single">
            <CrewChart data={chartData.crewData} />
          </div>
        </section>

        {/* Task Table */}
        <section className="table-section">
          <TaskTable data={data} />
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Blue Ox Enterprises, LLC • Schedule Management System</p>
      </footer>
    </div>
  );
}

export default App;
