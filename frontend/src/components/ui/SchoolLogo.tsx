import { cn } from '@/lib/utils'

/**
 * Placeholder monogram until a real school crest/logo file is supplied —
 * swap the <svg> below for an <img src="/logo.svg" /> and nothing else
 * needs to change, every caller just passes a size via className.
 */
export function SchoolLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('h-10 w-10', className)} aria-hidden="true">
      <defs>
        <linearGradient id="school-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#school-logo-gradient)" />
      <path
        d="M24 11l14 6.5-14 6.5-14-6.5L24 11Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M14 21.5V28c0 1.5 4.5 4 10 4s10-2.5 10-4v-6.5"
        stroke="white"
        strokeOpacity="0.95"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M38 19v8" stroke="white" strokeOpacity="0.95" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
