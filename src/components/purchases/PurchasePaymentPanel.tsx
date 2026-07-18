import { useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Copy, CreditCard, QrCode, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Button } from '../common/Button'
import { PurchaseStatusBadge } from './PurchaseStatusBadge'
import type { Purchase } from '../../types/purchase'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { cn } from '@/utils/cn'

interface PurchasePaymentPanelProps {
  purchase: Purchase
  compact?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
  showCourse?: boolean
}

type CopyKey = 'code' | 'content' | null

export function PurchasePaymentPanel({
  purchase,
  compact = false,
  isRefreshing = false,
  onRefresh,
  showCourse = true,
}: PurchasePaymentPanelProps) {
  const [copiedKey, setCopiedKey] = useState<CopyKey>(null)
  const [qrFailed, setQrFailed] = useState(false)
  const isPending = purchase.status === 'PENDING'
  const isPaid = purchase.status === 'PAID'
  const paymentProvider = purchase.paymentProvider || 'SEPAY'

  const handleCopy = async (key: CopyKey, value?: string) => {
    if (!key || !value || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
    } catch {
      setCopiedKey(null)
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          isPaid ? 'border-emerald-200 bg-emerald-50' : isPending ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
        )}
        data-testid={`payment-panel-${purchase.id ?? 'new'}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white',
              isPaid ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-red-700'
            )}
          >
            {isPaid ? <CheckCircle2 className="h-5 w-5" /> : isPending ? <QrCode className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-extrabold text-foreground">
                {isPaid ? 'Payment confirmed' : isPending ? 'SePay transfer pending' : 'Payment needs attention'}
              </p>
              <span className="text-xs font-bold text-muted-foreground">{paymentProvider}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isPending
                ? 'Open payment details to scan the QR code or copy the transfer content.'
                : isPaid
                  ? 'Vera has confirmed this payment.'
                  : 'Check the latest purchase status before continuing.'}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <CompactPaymentField
            label="Payment code"
            value={purchase.paymentCode || '-'}
            copyKey="code"
            copiedKey={copiedKey}
            onCopy={handleCopy}
          />
          <CompactPaymentField
            label="Transfer content"
            value={purchase.paymentContent || '-'}
            copyKey="content"
            copiedKey={copiedKey}
            onCopy={handleCopy}
          />
        </dl>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-white shadow-[0_18px_50px_rgba(27,89,56,0.10)]',
        isPaid ? 'border-emerald-200' : isPending ? 'border-amber-200' : 'border-red-200',
      )}
      data-testid={`payment-panel-${purchase.id ?? 'new'}`}
    >
      <div
        className={cn(
          'flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between',
          isPaid ? 'border-emerald-200 bg-emerald-50' : isPending ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white',
              isPaid ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-red-700'
            )}
          >
            {isPaid ? <CheckCircle2 className="h-6 w-6" /> : isPending ? <QrCode className="h-6 w-6" /> : <TriangleAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-foreground">
                {isPaid ? 'Payment confirmed' : isPending ? 'Complete your bank transfer' : 'Payment needs attention'}
              </h2>
              <PurchaseStatusBadge status={purchase.status} />
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isPaid
                ? 'Vera has confirmed this payment. Your course access is ready.'
                : isPending
                  ? 'Transfer the exact amount and keep the transfer content unchanged so Vera can match the payment.'
                  : 'This payment is not active anymore. Check the latest purchase status before trying again.'}
            </p>
          </div>
        </div>

        {onRefresh && (
          <Button type="button" variant="outline" size="sm" className="bg-white" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid gap-5 p-4 lg:grid-cols-[240px_1fr] lg:p-6">
        <div className="rounded-lg border border-border bg-[hsl(var(--brand-green-soft))] p-3">
          <div className="aspect-square overflow-hidden rounded-md border border-white bg-white">
            {purchase.paymentQrUrl && !qrFailed ? (
              <img
                src={purchase.paymentQrUrl}
                alt="SePay payment QR code"
                className="h-full w-full object-contain p-2"
                onError={() => setQrFailed(true)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
                <QrCode className="mb-3 h-9 w-9 text-[hsl(var(--brand-green))]" />
                QR image will appear when the payment provider is available.
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs font-bold uppercase tracking-normal text-[hsl(var(--brand-green))]">
            {paymentProvider}
          </p>
        </div>

        <div className="space-y-4">
          {showCourse && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Course</p>
              <h3 className="mt-1 text-xl font-extrabold text-foreground">
                {purchase.programName || `Program #${purchase.programId ?? '-'}`}
              </h3>
            </div>
          )}

          <dl className="grid gap-3 sm:grid-cols-2">
            <PaymentField
              label="Amount"
              value={formatCurrency(purchase.amount, purchase.currency || 'VND')}
              icon={<CreditCard className="h-4 w-4" />}
            />
            <PaymentField label="Payment code" value={purchase.paymentCode || '-'} copyKey="code" copiedKey={copiedKey} onCopy={handleCopy} />
            <PaymentField
              label="Transfer content"
              value={purchase.paymentContent || '-'}
              copyKey="content"
              copiedKey={copiedKey}
              onCopy={handleCopy}
              className="sm:col-span-2"
            />
            <PaymentField label="Created" value={formatDateTime(purchase.createdAt)} />
            <PaymentField label="Confirmed" value={formatDateTime(purchase.paidAt)} />
          </dl>

          {isPending && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Use the QR code or transfer manually with the exact amount and transfer content shown above. Vera will update this page automatically after payment is confirmed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PaymentFieldProps {
  label: string
  value: string
  icon?: ReactNode
  className?: string
  copyKey?: CopyKey
  copiedKey?: CopyKey
  onCopy?: (key: CopyKey, value?: string) => void
}

function PaymentField({ label, value, icon, className, copyKey, copiedKey, onCopy }: PaymentFieldProps) {
  const canCopy = !!copyKey && value !== '-'

  return (
    <div className={cn('rounded-lg border border-border bg-background p-3', className)}>
      <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-normal text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 flex items-start justify-between gap-3">
        <span className="break-words text-sm font-bold leading-6 text-foreground">{value}</span>
        {canCopy && (
          <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2" onClick={() => onCopy?.(copyKey, value)}>
            <Copy className="h-4 w-4" />
            {copiedKey === copyKey ? 'Copied' : 'Copy'}
          </Button>
        )}
      </dd>
    </div>
  )
}

function CompactPaymentField({ label, value, copyKey, copiedKey, onCopy }: PaymentFieldProps) {
  const canCopy = !!copyKey && value !== '-'

  return (
    <div className="min-w-0 rounded-md border border-white/80 bg-white p-3 shadow-sm">
      <dt className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</dt>
      <dd className="mt-2 flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-extrabold text-foreground" title={value}>
          {value}
        </span>
        {canCopy && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label={`Copy ${label.toLowerCase()}`}
            onClick={() => onCopy?.(copyKey, value)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </dd>
      {copiedKey === copyKey && <p className="mt-1 text-xs font-bold text-[hsl(var(--brand-green))]">Copied</p>}
    </div>
  )
}
