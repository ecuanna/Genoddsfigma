export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon — layered odds bars */}
      <rect x="2" y="8" width="6" height="24" rx="2" fill="#3B82F6" />
      <rect x="11" y="14" width="6" height="18" rx="2" fill="#60A5FA" />
      <rect x="20" y="4" width="6" height="28" rx="2" fill="white" />

      {/* Text — GENODDS */}
      <text
        x="34"
        y="28"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="1"
        fill="white"
      >
        GENODDS
      </text>
    </svg>
  );
}
