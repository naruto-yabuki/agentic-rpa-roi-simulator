import type { ProcessId } from "./processBenchmarks";

const commonProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 業務ごとの簡易アイコン (線画・単色。カード上でひと目で業務を識別するための補助) */
export function ProcessIcon({ id, className }: { id: ProcessId; className?: string }) {
  switch (id) {
    case "order_intake":
      return (
        <svg {...commonProps} className={className}>
          <path d="M3 8h18M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M3 8l3-4h12l3 4" />
          <path d="M9 12h6" />
        </svg>
      );
    case "invoicing":
      return (
        <svg {...commonProps} className={className}>
          <path d="M6 2h9l3 3v17l-3-2-3 2-3-2-3 2V2Z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "expense":
      return (
        <svg {...commonProps} className={className}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <circle cx="16" cy="14.5" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case "inquiry":
      return (
        <svg {...commonProps} className={className}>
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-2 2V11.5a8.5 8.5 0 0 1 8.5-8.5h1a8.5 8.5 0 0 1 8.5 8.5Z" />
        </svg>
      );
    case "purchasing":
      return (
        <svg {...commonProps} className={className}>
          <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <path d="M3 4h2l2.5 12h10l2-8H7" />
        </svg>
      );
    case "contract":
      return (
        <svg {...commonProps} className={className}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h.01M8 12h.01M8 16h.01M11 8h5M11 12h5M11 16h3" />
        </svg>
      );
    case "attendance":
      return (
        <svg {...commonProps} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      );
    case "credit_review":
      return (
        <svg {...commonProps} className={className}>
          <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
  }
}
