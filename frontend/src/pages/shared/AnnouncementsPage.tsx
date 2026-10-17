import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '@/api/announcements'
import { extractErrorMessage } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import type { Announcement } from '@/types/models'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/utils'

export function AnnouncementsPage() {
  const { hasRole } = useAuth()
  const canCreate = hasRole('admin') || hasRole('teacher')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', publish: true })
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['announcements'], queryFn: () => announcementsApi.list() })

  const createMutation = useMutation({
    mutationFn: () =>
      announcementsApi.create({
        title: form.title,
        body: form.body,
        audience: form.audience as Announcement['audience'],
        published_at: form.publish ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setOpen(false)
      setForm({ title: '', body: '', audience: 'all', publish: true })
    },
  })

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="School-wide and role-targeted notices"
        action={canCreate ? <Button onClick={() => setOpen(true)}>New announcement</Button> : undefined}
      />

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {data.data.map((a) => (
            <Card key={a.id}>
              <CardBody>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  {!a.published_at && <Badge tone="neutral">Draft</Badge>}
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-600">{a.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {a.audience === 'all' ? 'Everyone' : a.audience} · {a.published_at ? formatDateTime(a.published_at) : 'Not published'}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} title="New announcement" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <FormField label="Title" htmlFor="ann_title">
            <Input id="ann_title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Message" htmlFor="ann_body">
            <textarea
              id="ann_body"
              rows={4}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-ring"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </FormField>
          <FormField label="Audience" htmlFor="ann_audience">
            <Select id="ann_audience" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
              <option value="parent">Parents</option>
              <option value="accountant">Accountants</option>
            </Select>
          </FormField>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.publish} onChange={(e) => setForm({ ...form, publish: e.target.checked })} />
            Publish immediately
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!form.title || !form.body}
              onClick={async () => {
                setError(null)
                try {
                  await createMutation.mutateAsync()
                } catch (e) {
                  setError(extractErrorMessage(e))
                }
              }}
            >
              Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
