import axios from 'axios'

export const getApiErrorMessage = (error: unknown, fallbackMessage = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 403) {
      return 'You do not have permission to access this feature.'
    }

    if (status === 409) {
      return data?.message || 'This action conflicts with existing data. Please check again.'
    }

    if (status === 400) {
      return data?.message || 'The submitted data is invalid. Please check again.'
    }

    return data?.message || error.message || fallbackMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

export const isForbiddenError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403
}

export const isConflictError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 409
}

export const isValidationError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 400
}

export const getFriendlyApiErrorMessage = getApiErrorMessage
