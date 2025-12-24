import { AlertCircle, Clock } from 'lucide-react';

interface UpcomingTask {
  id: number;
  job: string;
  end_date: string;
  daysLeft: number;
  crew: string | null;
  phase: string;
}

interface UpcomingDeadlinesProps {
  tasks: UpcomingTask[];
}

export function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  const getUrgencyColor = (days: number) => {
    if (days < 0) return '#ef4444'; // Overdue
    if (days <= 3) return '#f59e0b'; // Very soon
    if (days <= 7) return '#fbbf24'; // This week
    return '#34d399'; // Good
  };

  const getUrgencyLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: '550ms',
        opacity: 0,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        height: '400px',
        overflow: 'auto',
      }}
    >
      <h3
        style={{
          color: 'var(--text-primary)',
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Clock size={20} style={{ color: 'var(--accent-amber)' }} />
        Upcoming Deadlines
      </h3>

      {tasks.length === 0 ? (
        <div
          style={{
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '40px 20px',
            fontSize: '0.9375rem',
          }}
        >
          No upcoming deadlines in the next 14 days
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => {
            const urgencyColor = getUrgencyColor(task.daysLeft);
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${urgencyColor}`,
                }}
              >
                {task.daysLeft <= 3 && (
                  <AlertCircle size={18} style={{ color: urgencyColor, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {task.job}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8125rem',
                      marginTop: '2px',
                    }}
                  >
                    {task.phase} {task.crew && `• ${task.crew}`}
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    background: `${urgencyColor}20`,
                    border: `1px solid ${urgencyColor}40`,
                    borderRadius: '12px',
                    color: urgencyColor,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getUrgencyLabel(task.daysLeft)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
