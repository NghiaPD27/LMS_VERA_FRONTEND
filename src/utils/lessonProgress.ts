export const formatLessonProgressStatus = (status?: string): string => {
  const normalized = status?.toUpperCase()

  switch (normalized) {
    case 'LOCKED':
      return 'Locked'
    case 'VIDEO_IN_PROGRESS':
      return 'Video in progress'
    case 'QUIZ_AVAILABLE':
      return 'Quiz available'
    case 'WAITING_FOR_TEACHER':
      return 'Waiting for teacher'
    case 'WAITING_FOR_CHECKPOINT':
      return 'Waiting for checkpoint'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status || 'Not started'
  }
}
