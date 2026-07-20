export const formatLessonProgressStatus = (status?: string): string => {
  const normalized = status?.toUpperCase()

  switch (normalized) {
    case 'LOCKED':
      return 'Locked'
    case 'VIDEO_AVAILABLE':
      return 'Video available'
    case 'QUIZ_AVAILABLE':
      return 'Quiz available'
    case 'WAITING_FOR_TEACHER':
      return 'Waiting for teacher'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status || 'Not started'
  }
}
