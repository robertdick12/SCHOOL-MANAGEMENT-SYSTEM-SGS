import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'

export function ParentOverviewPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'parent'], queryFn: dashboardApi.parent })

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name.split(' ')[0]}`} description="Your linked children" />

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.children.length === 0 ? (
        <EmptyState title="No children linked to your account yet" description="Contact the school office to link your child's record." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.children.map((child) => (
            <Link key={child.student_id} to={`/parent/children/${child.student_id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{child.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{child.class ?? 'Not enrolled'}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Outstanding balance</span>
                    <span className={child.outstanding_balance_pesewas > 0 ? 'font-medium text-amber-700 dark:text-amber-400' : 'font-medium text-emerald-700 dark:text-emerald-400'}>
                      {formatCurrency(child.outstanding_balance_pesewas)}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
