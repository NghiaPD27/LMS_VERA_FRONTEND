import type { PurchaseStatus } from '../../types/purchase'

const purchaseStatusMeta: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending confirmation',
    className: 'border-amber-500/40 bg-amber-950/50 text-amber-100',
  },
  PAID: {
    label: 'Paid',
    className: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border-border bg-muted text-muted-foreground',
  },
  FAILED: {
    label: 'Payment failed',
    className: 'border-red-500/40 bg-red-950/50 text-red-100',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'border-border bg-muted text-muted-foreground',
  },
}

interface PurchaseStatusBadgeProps {
  status?: PurchaseStatus | string
}

export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  const meta = status ? purchaseStatusMeta[status] : undefined

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
        meta?.className || 'border-border bg-muted text-muted-foreground'
      }`}
    >
      {meta?.label || status || 'Unknown status'}
    </span>
  )
}
