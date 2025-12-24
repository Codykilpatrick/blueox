import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#22d3ee', '#f472b6'];

interface PhaseChartProps {
  data: Array<{ name: string; value: number; [key: string]: string | number }>;
}

export function PhaseChart({ data }: PhaseChartProps) {
  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: '400ms',
        opacity: 0,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        height: '400px',
      }}
    >
      <h3
        style={{
          color: 'var(--text-primary)',
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '16px',
        }}
      >
        Tasks by Phase
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
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
