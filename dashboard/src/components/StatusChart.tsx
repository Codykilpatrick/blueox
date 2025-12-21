import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  S: { label: 'Scheduled', color: '#38bdf8' },
  A: { label: 'Active', color: '#fbbf24' },
  D: { label: 'Done', color: '#34d399' },
  P: { label: 'Potential', color: '#a78bfa' },
  L: { label: 'Late', color: '#ef4444' },
  E: { label: 'Early', color: '#22d3ee' },
  C: { label: 'Clearance', color: '#f472b6' },
};

interface StatusChartProps {
  data: Record<string, number>;
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status]?.label || status,
      value: count,
      color: STATUS_CONFIG[status]?.color || '#64748b',
    }));

  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: '350ms',
        opacity: 0,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        height: '400px',
      }}
    >
      <h3 style={{ 
        color: 'var(--text-primary)', 
        fontSize: '1.125rem', 
        fontWeight: 600,
        marginBottom: '16px',
      }}>
        Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontFamily: "'Outfit', sans-serif",
            }}
            labelStyle={{ color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend
            wrapperStyle={{
              color: 'var(--text-secondary)',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.875rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

