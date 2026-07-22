import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentTeacherApi } from '../api/studentTeacherApi'
import { teacherAdminApi } from '../api/teacherAdminApi'
import { teacherApi } from '../api/teacherApi'
import type {
  CreateAvailabilityRequest,
  ReviewBookingRequest,
  StudentBookingQueryParams,
  TeacherAvailabilityQueryParams,
  TeacherQueryParams,
  UpsertTeacherCompensationRequest,
} from '../types/teacher'

export const adminTeachersQueryKey = (params: TeacherQueryParams = {}) => ['admin-teachers', params] as const
export const adminTeacherQueryKey = (id?: number) => ['admin-teacher', id] as const
export const teacherEarningsQueryKey = (teacherId?: number) => ['teacher-earnings', teacherId] as const
export const teacherStudentsQueryKey = ['teacher-students'] as const
export const teacherBookingsQueryKey = (status?: string) => ['teacher-bookings', status || 'all'] as const
export const teacherAvailabilityQueryKey = (params: TeacherAvailabilityQueryParams = {}) => ['teacher-availability', params] as const
export const studentTeacherSlotsQueryKey = (lessonId?: number) => ['student-teacher-slots', lessonId] as const
export const studentBookingsQueryKey = (params: StudentBookingQueryParams = {}) => ['student-bookings', params] as const

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
      queryClient.invalidateQueries({ queryKey: teacherEarningsQueryKey(variables.teacherId) })
    },
  })
}

export const useGetTeacherEarnings = (teacherId?: number, enabled = true) =>
  useQuery({
    queryKey: teacherEarningsQueryKey(teacherId),
    queryFn: () => teacherAdminApi.getTeacherEarnings(teacherId as number),
    enabled: !!teacherId && enabled,
    retry: false,
  })

export const useCreateTeacherAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAvailabilityRequest) => teacherApi.createAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-availability'] })
      queryClient.invalidateQueries({ queryKey: teacherBookingsQueryKey() })
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

export const useGetTeacherBookings = (status?: string) =>
  useQuery({
    queryKey: teacherBookingsQueryKey(status),
    queryFn: () => teacherApi.getBookings(status || undefined),
    retry: false,
  })

export const useReviewTeacherBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: number; data: ReviewBookingRequest }) =>
      teacherApi.reviewBooking(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-bookings'] })
      queryClient.invalidateQueries({ queryKey: teacherStudentsQueryKey })
    },
  })
}

export const useGetStudentTeacherSlots = (lessonId?: number, enabled = true) =>
  useQuery({
    queryKey: studentTeacherSlotsQueryKey(lessonId),
    queryFn: () => studentTeacherApi.getTeacherSlots(lessonId as number),
    enabled: !!lessonId && enabled,
    retry: false,
  })

export const useCreateStudentBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentTeacherApi.createBooking,
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: studentTeacherSlotsQueryKey(booking.lessonId) })
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
      queryClient.invalidateQueries({ queryKey: studentTeacherSlotsQueryKey(booking.lessonId) })
      if (booking.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lesson-learning-state', booking.lessonId] })
      }
    },
  })
}
