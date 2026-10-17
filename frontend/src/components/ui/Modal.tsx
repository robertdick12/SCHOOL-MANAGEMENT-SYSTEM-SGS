import { useEffect, useRef, type ReactNode } from 'react'

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-lg backdrop:bg-slate-900/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="focus-ring rounded-md p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
