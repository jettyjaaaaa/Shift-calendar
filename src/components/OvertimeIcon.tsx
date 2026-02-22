export function OvertimeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="OT"
    >
      <circle cx="8" cy="9" r="5" />
      <path d="M8 6v3l2 1.25M6.25 2h3.5M8 2v2" />
    </svg>
  );
}
