export type Role = 'platform_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'accountant'

export type SchoolStatus = 'pending' | 'active' | 'suspended'

export interface AuthUserSchool {
  id: number
  name: string
  status: SchoolStatus
}

export interface AuthUser {
  id: number
  name: string
  email: string
  /** Every authenticated user has at least one role; the backend /me endpoint guarantees this. */
  roles: [Role, ...Role[]]
  permissions: string[]
  /** null for platform_admin accounts, which aren't tied to any one school. */
  school: AuthUserSchool | null
}
