import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'good' | 'warning' | 'critical'

const toneText: Record<Tone, string> = {
  neutral: 'text-slate-500 dark:text-slate-400',
  good: 'text-[#0ca30c] dark:text-emerald-400',
  warning: 'text-[#b8790f] dark:text-amber-400',
  critical: 'text-[#d03b3b] dark:text-red-400',
}

export function StatTile({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: Tone
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {hint && <p className={cn('mt-1 text-xs font-medium', toneText[tone])}>{hint}</p>}
    </div>
  )
}
