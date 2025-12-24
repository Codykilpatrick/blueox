import { STATUS_LABELS, STATUS_COLORS } from '../types';

interface StatusBadgeProps {
  status: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || '#64748b';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
        }}
      />
      {label}
    </span>
  );
}
