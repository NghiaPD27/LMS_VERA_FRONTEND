import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentTeacherApi } from '../api/studentTeacherApi'
import { teacherAdminApi } from '../api/teacherAdminApi'
import { teacherApi } from '../api/teacherApi'
import type {
  CreateAvailabilityRequest,
  CreatePrivateBookingRequest,
  PrivateBookingQueryParams,
  PrivateTeacherSlotQueryParams,
  ReviewBookingRequest,
  StudentBookingQueryParams,
  StudentTeacherSlotQueryParams,
  TeacherAvailabilityQueryParams,
  TeacherBookingQueryParams,
  TeacherEarningsQueryParams,
  TeacherQueryParams,
  UpsertTeacherCompensationRequest,
} from '../types/teacher'

export const adminTeachersQueryKey = (params: TeacherQueryParams = {}) => ['admin-teachers', params] as const
export const adminTeacherQueryKey = (id?: number) => ['admin-teacher', id] as const
export const teacherSelfEarningsQueryKey = (params: TeacherEarningsQueryParams = {}) => ['teacher-self-earnings', params] as const
export const teacherEarningsQueryKey = (teacherId?: number, params: TeacherEarningsQueryParams = {}) =>
  ['teacher-earnings', teacherId, params] as const
export const teacherStudentsQueryKey = ['teacher-students'] as const
export const teacherBookingsQueryKey = (params: TeacherBookingQueryParams = {}) => ['teacher-bookings', params] as const
export const teacherPrivateBookingsQueryKey = (params: TeacherBookingQueryParams = {}) => ['teacher-private-bookings', params] as const
export const teacherAvailabilityQueryKey = (params: TeacherAvailabilityQueryParams = {}) => ['teacher-availability', params] as const
export const studentTeacherSlotsQueryKey = (lessonId?: number, params: StudentTeacherSlotQueryParams = {}) => ['student-teacher-slots', lessonId, params] as const
export const studentBookingsQueryKey = (params: StudentBookingQueryParams = {}) => ['student-bookings', params] as const
export const privateTeachersQueryKey = (params: TeacherQueryParams = {}) => ['student-private-teachers', params] as const
export const studentPrivateTeacherSlotsQueryKey = (params: PrivateTeacherSlotQueryParams = {}) => ['student-private-teacher-slots', params] as const
export const studentPrivateBookingsQueryKey = (params: PrivateBookingQueryParams = {}) => ['student-private-bookings', params] as const

export const useGetAdminTeachers = (params: TeacherQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: adminTeachersQueryKey(params),
    queryFn: () => teacherAdminApi.getTeachers(params),
    enabled,
    retry: false,
  })

export const useGetAdminTeacher = (id?: number, enabled = true) =>
  useQuery({
    queryKey: adminTeacherQueryKey(id),
    queryFn: () => teacherAdminApi.getTeacher(id as number),
    enabled: !!id && enabled,
    retry: false,
  })

export const useAssignTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ enrollmentId, teacherId }: { enrollmentId: number; teacherId: number }) =>
      teacherAdminApi.assignTeacher(enrollmentId, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      queryClient.invalidateQueries({ queryKey: teacherStudentsQueryKey })
    },
  })
}

export const useUpsertTeacherCompensation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teacherId, data }: { teacherId: number; data: UpsertTeacherCompensationRequest }) =>
      teacherAdminApi.upsertCompensation(teacherId, {
        ...data,
        currency: data.currency || 'VND',
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-earnings', variables.teacherId] })
    },
  })
}

export const useGetMyTeacherEarnings = (params: TeacherEarningsQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: teacherSelfEarningsQueryKey(params),
    queryFn: () => teacherApi.getMyEarnings(params),
    enabled,
    retry: false,
  })

export const useGetTeacherEarnings = (
  teacherId?: number,
  params: TeacherEarningsQueryParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: teacherEarningsQueryKey(teacherId, params),
    queryFn: () => teacherAdminApi.getTeacherEarnings(teacherId as number, params),
    enabled: !!teacherId && enabled,
    retry: false,
  })

export const useCreateTeacherAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAvailabilityRequest) => teacherApi.createAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-availability'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-bookings'] })
    },
  })
}

export const useGetTeacherAvailability = (params: TeacherAvailabilityQueryParams = {}) =>
  useQuery({
    queryKey: teacherAvailabilityQueryKey(params),
    queryFn: () => teacherApi.getAvailability(params),
    retry: false,
  })

export const useDeleteTeacherAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-availability'] })
      queryClient.invalidateQueries({ queryKey: ['student-teacher-slots'] })
    },
  })
}

export const useGetTeacherStudents = () =>
  useQuery({
    queryKey: teacherStudentsQueryKey,
    queryFn: teacherApi.getStudents,
    retry: false,
  })

export const useGetTeacherBookings = (params: TeacherBookingQueryParams = {}) =>
  useQuery({
    queryKey: teacherBookingsQueryKey(params),
    queryFn: () => teacherApi.getBookings(params),
    retry: false,
  })

export const useReviewTeacherBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: number; data: ReviewBookingRequest }) =>
      teacherApi.reviewBooking(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-self-earnings'] })
      queryClient.invalidateQueries({ queryKey: teacherStudentsQueryKey })
    },
  })
}

export const useGetTeacherPrivateBookings = (params: TeacherBookingQueryParams = {}) =>
  useQuery({
    queryKey: teacherPrivateBookingsQueryKey(params),
    queryFn: () => teacherApi.getPrivateBookings(params),
    retry: false,
  })

export const useCompleteTeacherPrivateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: number) => teacherApi.completePrivateBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-private-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-availability'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-self-earnings'] })
    },
  })
}

export const useGetStudentTeacherSlots = (lessonId?: number, params: StudentTeacherSlotQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: studentTeacherSlotsQueryKey(lessonId, params),
    queryFn: () => studentTeacherApi.getTeacherSlots(lessonId as number, params),
    enabled: !!lessonId && enabled,
    retry: false,
  })

export const useCreateStudentBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentTeacherApi.createBooking,
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['student-teacher-slots'] })
      if (booking.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lesson-learning-state', booking.lessonId] })
      }
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
    },
  })
}

export const useGetStudentBookings = (params: StudentBookingQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: studentBookingsQueryKey(params),
    queryFn: () => studentTeacherApi.getBookings(params),
    enabled,
    retry: false,
  })

export const useCancelStudentBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => studentTeacherApi.cancelBooking(id),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['student-teacher-slots'] })
      if (booking.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lesson-learning-state', booking.lessonId] })
      }
    },
  })
}

export const useGetPrivateTeachers = (params: TeacherQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: privateTeachersQueryKey(params),
    queryFn: () => studentTeacherApi.getPrivateTeachers(params),
    enabled,
    retry: false,
  })

export const useGetStudentPrivateTeacherSlots = (
  params: PrivateTeacherSlotQueryParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: studentPrivateTeacherSlotsQueryKey(params),
    queryFn: () => studentTeacherApi.getPrivateTeacherSlots(params),
    enabled: !!params.teacherId && enabled,
    retry: false,
  })

export const useCreateStudentPrivateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePrivateBookingRequest) => studentTeacherApi.createPrivateBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-private-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['student-private-teacher-slots'] })
    },
  })
}

export const useGetStudentPrivateBookings = (params: PrivateBookingQueryParams = {}, enabled = true) =>
  useQuery({
    queryKey: studentPrivateBookingsQueryKey(params),
    queryFn: () => studentTeacherApi.getPrivateBookings(params),
    enabled,
    retry: false,
  })

export const useCancelStudentPrivateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => studentTeacherApi.cancelPrivateBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-private-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['student-private-teacher-slots'] })
    },
  })
}
