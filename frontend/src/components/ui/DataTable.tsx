import type { ReactNode } from 'react'
import { PageSpinner } from './Spinner'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyTitle = 'No records yet',
  emptyDescription,
}: {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (isLoading) return <PageSpinner />
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.header} className={col.className ?? 'px-4 py-2.5 text-slate-700'}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
