export type Role = 'admin' | 'teacher' | 'student' | 'parent' | 'accountant'

export interface AuthUser {
  id: number
  name: string
  email: string
  /** Every authenticated user has at least one role; the backend /me endpoint guarantees this. */
  roles: [Role, ...Role[]]
  permissions: string[]
}
