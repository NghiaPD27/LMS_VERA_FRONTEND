import axios from 'axios'

export const getApiErrorMessage = (error: unknown, fallbackMessage = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 403) {
      return 'Ban khong co quyen truy cap chuc nang nay'
    }

    if (status === 409) {
      return data?.message || 'Du lieu dang bi xung dot. Vui long kiem tra lai.'
    }

    if (status === 400) {
      return data?.message || 'Du lieu khong hop le. Vui long kiem tra lai.'
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
