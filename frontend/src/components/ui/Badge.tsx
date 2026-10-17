import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const toneClasses: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}
