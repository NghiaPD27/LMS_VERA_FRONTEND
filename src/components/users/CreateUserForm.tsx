import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  type CreateTeacherInput,
  createStudentSchema,
  createTeacherSchema,
  createEvaluatorSchema,
} from './adminUserSchema';
import { adminUsersApi, type CreateUserRequest, type CreateUserRole } from '../../api/adminUsersApi';
import { Button } from '../common/Button';

interface CreateUserFormProps {
  role: CreateUserRole;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ role }) => {
  const [success, setSuccess] = useState<string | null>(null);

  const schema = role === 'student' ? createStudentSchema : role === 'teacher' ? createTeacherSchema : createEvaluatorSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeacherInput>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createUser, isPending, error: submitError } = useMutation({
    mutationFn: (data: CreateUserRequest) => adminUsersApi.createUser(role, data),
    onSuccess: (data) => {
      setSuccess(`Successfully created ${role}: ${data.username ?? 'new user'}`);
      reset();
    },
    onError: () => {
      setSuccess(null);
    },
  });

  const onSubmit = async (data: CreateTeacherInput) => {
    try {
      setSuccess(null);
      const payload: CreateUserRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || undefined,
        ...(role === 'teacher' ? { bio: data.bio || undefined } : {}),
      };
      await createUser(payload);
    } catch {
      // Handled by mutation state
    }
  };

  const serverError = axios.isAxiosError(submitError)
    ? submitError.response?.data?.message || 'Failed to create user'
    : null;

  return (
    <div className="lms-surface p-6">
      <h3 className="mb-4 text-lg font-extrabold text-foreground capitalize">
        Create {role}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <div data-testid="success-message" className="lms-alert-success">
            {success}
          </div>
        )}
        {serverError && (
          <div data-testid="error-message" className="lms-alert-error">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-foreground">Username</label>
          <input
            id="username"
            type="text"
            data-testid="username-input"
            className="lms-input"
            disabled={isPending}
            {...register('username')}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600" data-testid="username-error">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground">Email</label>
          <input
            id="email"
            type="text"
            data-testid="email-input"
            className="lms-input"
            disabled={isPending}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600" data-testid="email-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</label>
          <input
            id="password"
            type="password"
            data-testid="password-input"
            className="lms-input"
            disabled={isPending}
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600" data-testid="password-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-semibold text-foreground">First Name</label>
          <input
            id="firstName"
            type="text"
            data-testid="first-name-input"
            className="lms-input"
            disabled={isPending}
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600" data-testid="first-name-error">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-semibold text-foreground">Last Name</label>
          <input
            id="lastName"
            type="text"
            data-testid="last-name-input"
            className="lms-input"
            disabled={isPending}
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600" data-testid="last-name-error">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-foreground">Phone Number (Optional)</label>
          <input
            id="phoneNumber"
            type="text"
            data-testid="phone-number-input"
            className="lms-input"
            disabled={isPending}
            {...register('phoneNumber')}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-red-600" data-testid="phone-number-error">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {role === 'teacher' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-foreground">Bio (Optional)</label>
            <textarea
              id="bio"
              data-testid="bio-input"
              className="lms-input"
              disabled={isPending}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-600" data-testid="bio-error">
                {errors.bio.message}
              </p>
            )}
          </div>
        )}

        <div>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="submit-button"
            className="w-full"
          >
            {isPending ? 'Creating...' : `Create ${role}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

