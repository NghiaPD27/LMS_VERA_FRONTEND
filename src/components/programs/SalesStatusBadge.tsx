const salesStatusMeta: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  PUBLISHED: {
    label: 'On Sale',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
}

interface SalesStatusBadgeProps {
  status?: string
}

export function SalesStatusBadge({ status }: SalesStatusBadgeProps) {
  const meta = status ? salesStatusMeta[status] : undefined

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
        meta?.className || 'border-border bg-muted text-muted-foreground'
      }`}
    >
      {meta?.label || status || 'No status'}
    </span>
  )
}
