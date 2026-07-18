import type { PurchaseStatus } from '../../types/purchase'

const purchaseStatusMeta: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending confirmation',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  PAID: {
    label: 'Paid',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  FAILED: {
    label: 'Payment failed',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
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
