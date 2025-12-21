import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface CrewData {
  name: string;
  weeks: number;
}

interface CrewChartProps {
  data: CrewData[];
}

const getBarColor = (index: number) => {
  const colors = ['#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#fb7185', '#22d3ee', '#f472b6', '#4ade80', '#60a5fa', '#c084fc'];
  return colors[index % colors.length];
};

export function CrewChart({ data }: CrewChartProps) {
  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: '600ms',
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
        Crew Workload (Weeks)
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
          <XAxis 
            type="number"
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            width={75}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontFamily: "'Outfit', sans-serif",
            }}
            formatter={(value: number) => [`${value} weeks`, 'Workload']}
          />
          <Bar dataKey="weeks" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

