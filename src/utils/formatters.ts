export const formatCurrency = (amount?: number, currency = 'VND') => {
  if (amount === undefined || amount === null) {
    return 'Contact us'
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'VND',
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-US')} ${currency || ''}`.trim()
  }
}

export const formatDateTime = (value?: string) => {
  if (!value) {
    return '-'
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}
