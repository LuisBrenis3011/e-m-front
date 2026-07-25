interface StatusBadgeProps {
  status: string;
  color: string;
}

export function StatusBadge({ status, color }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        backgroundColor: `${color}20`,
        color,
        fontSize: '12px',
        fontWeight: 600,
        border: `1px solid ${color}40`,
      }}
    >
      {status}
    </span>
  );
}
