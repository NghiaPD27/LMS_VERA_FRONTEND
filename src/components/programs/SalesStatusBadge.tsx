const salesStatusMeta: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-border bg-muted text-muted-foreground',
  },
  PUBLISHED: {
    label: 'On Sale',
    className: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'border-amber-500/40 bg-amber-950/50 text-amber-100',
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
