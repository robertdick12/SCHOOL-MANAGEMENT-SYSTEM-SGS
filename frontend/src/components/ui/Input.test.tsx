import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from './Input'

describe('PasswordInput', () => {
  it('hides the value by default', () => {
    render(<PasswordInput aria-label="Password" defaultValue="secret123" />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('reveals the value when the toggle is clicked, and hides it again on a second click', async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" defaultValue="secret123" />)

    const input = screen.getByLabelText('Password')
    const toggle = screen.getByRole('button', { name: /show password/i })

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('does not steal tab focus (tabIndex -1 on the toggle)', () => {
    render(<PasswordInput aria-label="Password" />)
    expect(screen.getByRole('button', { name: /show password/i })).toHaveAttribute('tabindex', '-1')
  })
})
