import { z } from 'zod';

const baseUserSchema = z.object({
  username: z.string({ message: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters'),
  email: z.string({ message: 'Email is required' })
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z.string({ message: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  firstName: z.string({ message: 'First name is required' })
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string({ message: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  phoneNumber: z.string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^\d*$/, 'Phone number must contain only digits')
    .optional()
    .nullable(),
});

export const createStudentSchema = baseUserSchema;

export const createEvaluatorSchema = baseUserSchema;

export const createTeacherSchema = baseUserSchema.extend({
  bio: z.string().optional().nullable(),
});

export const updateUserStatusSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .optional()
    .nullable(),
  enabled: z.boolean().optional(),
  status: z.string().optional().nullable(),
});

export const extendAccountSchema = z.object({
  months: z.number({ message: 'Months is required' })
    .int('Months must be an integer')
    .min(1, 'Months must be at least 1'),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type CreateEvaluatorInput = z.infer<typeof createEvaluatorSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ExtendAccountInput = z.infer<typeof extendAccountSchema>;
