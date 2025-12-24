interface PhaseProgress {
  name: string;
  total: number;
  done: number;
  percentage: number;
}

interface ProgressChartProps {
  data: PhaseProgress[];
}

const PHASE_COLORS: Record<string, string> = {
  Earthwork: '#38bdf8',
  Pipe: '#34d399',
  Roads: '#fbbf24',
  Concrete: '#fb7185',
  Paving: '#a78bfa',
  Clearance: '#22d3ee',
  'Punch Out': '#f472b6',
};

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: '450ms',
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
        }}
      >
        Phase Completion
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.map((phase) => {
          const color = PHASE_COLORS[phase.name] || '#64748b';
          return (
            <div key={phase.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                >
                  {phase.name}
                </span>
                <span
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8125rem',
                  }}
                >
                  {phase.done} / {phase.total} ({phase.percentage}%)
                </span>
              </div>
              <div
                style={{
                  height: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${phase.percentage}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                    borderRadius: '6px',
                    transition: 'width 0.5s ease-out',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
