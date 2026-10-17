import { useTheme } from '@/theme/ThemeContext'
import { cn } from '@/lib/utils'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={cn(
        'focus-ring relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors',
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100',
      )}
    >
      <span className="flex w-full items-center justify-between px-1.5 text-slate-500 dark:text-slate-400">
        <SunIcon />
        <MoonIcon />
      </span>
      <span
        className={cn(
          'absolute left-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-transform dark:bg-slate-200',
          isDark ? 'translate-x-7' : 'translate-x-0',
        )}
      />
    </button>
  )
}
