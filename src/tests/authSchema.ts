import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string({ message: 'Username is required' }).min(1, 'Username is required'),
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string({ message: 'Old password is required' }).min(1, 'Old password is required'),
  newPassword: z.string({ message: 'New password is required' }).min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string({ message: 'Confirm password is required' }).min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
