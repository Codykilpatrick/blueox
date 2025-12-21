import { useState, useEffect } from 'react';
import { Briefcase, Users, Calendar, Clock, CheckCircle, Activity, HardHat, LogOut, Plus, Shield } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { canAddJobs, canEditJobs, canDeleteJobs } from './lib/supabase';
import type { Task } from './lib/supabase';
import { StatCard } from './components/StatCard';
import { PhaseChart } from './components/PhaseChart';
import { TimelineChart } from './components/TimelineChart';
import { CrewChart } from './components/CrewChart';
import { TaskTable } from './components/TaskTable';
import { Login } from './components/Login';
import { JobModal } from './components/JobModal';
import './App.css';

// Helper to compute stats from tasks
function computeStats(tasks: Task[]) {
  const uniqueJobs = new Set(tasks.map((d) => d.job).filter(Boolean));
  const uniqueCrews = new Set(tasks.map((d) => d.crew).filter((c) => c && c !== 'Unassigned'));
  
  const statusCounts: Record<string, number> = {};
  const phaseCounts: Record<string, number> = {};
  const crewWorkload: Record<string, number> = {};
  const monthlyTasks: Record<string, number> = {};

  tasks.forEach((task) => {
    const status = task.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    const phase = task.sheet;
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;

    if (task.crew && task.crew !== 'Unassigned' && task.weeks) {
      crewWorkload[task.crew] = (crewWorkload[task.crew] || 0) + task.weeks;
    }

    if (task.start_date) {
      const month = task.start_date.slice(0, 7);
      monthlyTasks[month] = (monthlyTasks[month] || 0) + 1;
    }
  });

  const totalWeeks = tasks.reduce((sum, t) => sum + (t.weeks || 0), 0);
  const activeTasks = tasks.filter((t) => t.status === 'A').length;
  const doneTasks = tasks.filter((t) => t.status === 'D').length;

  return {
    totalTasks: tasks.length,
    totalJobs: uniqueJobs.size,
    totalCrews: uniqueCrews.size,
    totalWeeks: Math.round(totalWeeks),
    activeTasks,
    doneTasks,
    statusCounts,
    phaseCounts,
    crewWorkload,
    monthlyTasks,
  };
}


function computeChartData(stats: ReturnType<typeof computeStats>) {
  const phaseData = Object.entries(stats.phaseCounts).map(([name, value]) => ({
    name,
    value,
  } as { name: string; value: number; [key: string]: string | number }));

  const crewData = Object.entries(stats.crewWorkload)
    .map(([name, weeks]) => ({
      name,
      weeks: Math.round(weeks * 10) / 10,
    }))
    .sort((a, b) => b.weeks - a.weeks)
    .slice(0, 10);

  const monthlyData = Object.entries(stats.monthlyTasks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count,
    }));

  return { phaseData, crewData, monthlyData };
}

function App() {
  const { user, role, loading: authLoading, error: authError, signIn, signOut, isAuthenticated } = useAuth();
  const { tasks, loading: tasksLoading, initialized, fetchTasks, addTask, updateTask, deleteTask } = useTasks();
  
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated && !initialized) {
      fetchTasks();
    }
  }, [isAuthenticated, initialized, fetchTasks]);

  // Show loading while checking auth
  if (authLoading) {
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
    return <Login onLogin={signIn} error={authError} />;
  }

  // Compute stats and chart data from tasks
  const stats = tasks.length > 0 ? computeStats(tasks) : null;
  const chartData = stats ? computeChartData(stats) : null;

  const handleAddJob = () => {
    setEditingTask(null);
    setJobModalOpen(true);
  };

  const handleEditJob = (task: Task) => {
    setEditingTask(task);
    setJobModalOpen(true);
  };

  const handleSaveJob = async (taskData: Parameters<typeof addTask>[0]) => {
    if (editingTask) {
      return await updateTask(editingTask.id, taskData);
    } else {
      return await addTask(taskData);
    }
  };

  const handleDeleteJob = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  // Convert Task[] to the format TaskTable expects (with id for actions)
  const tableData = tasks.map((t) => ({
    id: t.id,
    sheet: t.sheet,
    job: t.job,
    phase: t.phase,
    crew: t.crew,
    description: t.description,
    status: t.status,
    weeks: t.weeks,
    start: t.start_date,
    end: t.end_date,
  }));

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'editor': return '#f59e0b';
      default: return '#6b7280';
    }
  };

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
            {/* Role Badge */}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: `${getRoleBadgeColor()}20`,
                border: `1px solid ${getRoleBadgeColor()}40`,
                borderRadius: '20px',
                color: getRoleBadgeColor(),
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              <Shield size={14} />
              {role}
            </span>
            
            <span className="update-badge">
              <Activity size={14} />
              Live Data
            </span>
            
            <span className="date-display">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            
            {/* Add Job Button (for editor/admin) */}
            {canAddJobs(role) && (
              <button
                onClick={handleAddJob}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Add Job
              </button>
            )}
            
            <button
              onClick={signOut}
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
        {(tasksLoading || !initialized) ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #1e3a5f',
              borderTopColor: '#38bdf8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : stats && chartData ? (
          <>
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
              <TaskTable 
                data={tableData} 
                canEdit={canEditJobs(role)}
                canDelete={canDeleteJobs(role)}
                onEdit={(id) => {
                  const task = tasks.find(t => t.id === id);
                  if (task) handleEditJob(task);
                }}
                onDelete={handleDeleteJob}
              />
            </section>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <p>No tasks found. {canAddJobs(role) && 'Click "Add Job" to create your first task.'}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Blue Ox Enterprises, LLC • Schedule Management System • Logged in as {user?.email}</p>
      </footer>

      {/* Job Modal */}
      <JobModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        onSave={handleSaveJob}
        task={editingTask}
        mode={editingTask ? 'edit' : 'add'}
      />
    </div>
  );
}

export default App;
