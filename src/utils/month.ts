const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export const getCurrentVietnamMonth = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value

  return year && month ? `${year}-${month}` : date.toISOString().slice(0, 7)
}

export const formatMonthLabel = (month?: string) => {
  if (!month) return 'All time'
  const [year, monthNumber] = month.split('-')
  return year && monthNumber ? `${monthNumber}/${year}` : month
}
