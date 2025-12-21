import type { ComponentType } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: `${delay * 100}ms`,
        opacity: 0,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem', 
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            {title}
          </p>
          <p style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          style={{
            background: `${color}15`,
            borderRadius: '12px',
            padding: '12px',
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  );
}

