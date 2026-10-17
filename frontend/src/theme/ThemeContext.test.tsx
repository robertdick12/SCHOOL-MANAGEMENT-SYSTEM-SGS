import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

function Harness() {
  const { theme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <ThemeToggle />
    </div>
  )
}

describe('ThemeProvider + ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light when nothing is stored and the OS has no dark preference', () => {
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles to dark, updates the <html> class, and persists to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('switch'))

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('sms-theme')).toBe('dark')
  })

  it('restores a previously saved theme on mount', () => {
    localStorage.setItem('sms-theme', 'dark')

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
