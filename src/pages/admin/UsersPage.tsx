import React, { useState } from 'react'
import { KeyRound, Search, ShieldCheck } from 'lucide-react'
import { CreateUserForm } from '../../components/users/CreateUserForm'
import { UserStatusForm } from '../../components/users/UserStatusForm'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetAdminUser, useGetAdminUsers, useResetUserPassword } from '../../hooks/useAdminUsers'
import { getFriendlyApiErrorMessage } from '../../utils/errorMessage'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const tabs = [
  { key: 'student', label: 'Create Student' },
  { key: 'teacher', label: 'Create Teacher' },
  { key: 'evaluator', label: 'Create Evaluator' },
  { key: 'status', label: 'Update Status' },
] as const

type UserTab = (typeof tabs)[number]['key']

export const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserTab>('student')
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>()
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const usersQuery = useGetAdminUsers({
    keyword: keyword || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    size: 10,
  })
  const selectedUserQuery = useGetAdminUser(selectedUserId, !!selectedUserId)
  const resetPasswordMutation = useResetUserPassword()
  const users = usersQuery.data?.content ?? []
  const totalPages = usersQuery.data?.totalPages ?? 0

  const resetPassword = async () => {
    if (!selectedUserId || !temporaryPassword.trim()) {
      setError('Choose a user and enter a temporary password.')
      return
    }

    try {
      setMessage(null)
      setError(null)
      await resetPasswordMutation.mutateAsync({
        userId: selectedUserId,
        data: { temporaryPassword: temporaryPassword.trim() },
      })
      setTemporaryPassword('')
      setMessage(`Temporary password reset for user #${selectedUserId}.`)
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err, 'Failed to reset password'))
    }
  }

  return (
    <section className="lms-page-shell">
      <div className="lms-page-hero">
        <div className="lms-page-hero-inner">
          <div className="relative flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary sm:flex">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="lms-section-title">User & Account Management</h1>
              <p className="lms-section-description">
                Create users and update account access status. Course expiry is managed from enrollments.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <nav className="lms-surface flex flex-col gap-2 p-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              data-testid={`tab-${tab.key}`}
              className={`rounded-md px-4 py-2.5 text-left text-sm font-semibold transition-[background-color,color,box-shadow,transform] hover:-translate-y-0.5 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(244,122,61,0.16)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main>
          {activeTab === 'student' && <CreateUserForm role="student" />}
          {activeTab === 'teacher' && <CreateUserForm role="teacher" />}
          {activeTab === 'evaluator' && <CreateUserForm role="evaluator" />}
          {activeTab === 'status' && <UserStatusForm />}
        </main>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">User directory</h2>
            <p className="mt-1 text-sm text-muted-foreground">Search accounts, inspect access state, and reset temporary passwords.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <Search className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_160px_160px_auto] md:items-end">
          <div>
            <label htmlFor="admin-user-search" className="text-sm font-bold text-foreground">Search</label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-user-search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setPage(0)
                }}
                className="lms-input pl-9"
                placeholder="Username or email"
              />
            </div>
          </div>
          <div>
            <label htmlFor="admin-user-role" className="text-sm font-bold text-foreground">Role</label>
            <select id="admin-user-role" value={role} onChange={(event) => { setRole(event.target.value); setPage(0) }} className="lms-input mt-1">
              <option value="">All</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="EVALUATOR">EVALUATOR</option>
            </select>
          </div>
          <div>
            <label htmlFor="admin-user-status" className="text-sm font-bold text-foreground">Status</label>
            <select id="admin-user-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0) }} className="lms-input mt-1">
              <option value="">All</option>
              <option value="active">active</option>
              <option value="disabled">disabled</option>
              <option value="expired">expired</option>
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setKeyword('')
              setRole('')
              setStatus('')
              setPage(0)
            }}
          >
            Clear
          </Button>
        </div>

        {message && <div className="mb-4 lms-alert-success">{message}</div>}
        {error && <div className="mb-4 lms-alert-error">{error}</div>}

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="overflow-x-auto rounded-lg border border-border">
            {usersQuery.isLoading ? (
              <LoadingState message="Loading users..." />
            ) : usersQuery.isError ? (
              <div className="m-4 lms-alert-error">{getFriendlyApiErrorMessage(usersQuery.error, 'Failed to load users')}</div>
            ) : users.length === 0 ? (
              <EmptyState message="No users found" description="Adjust filters or create a new account." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={selectedUserId === user.id ? 'bg-[hsl(var(--brand-orange-soft))]/50' : undefined}>
                      <TableCell>
                        <p className="font-bold text-foreground">{user.username || `User #${user.id}`}</p>
                        <p className="text-sm text-muted-foreground">{user.email || '-'}</p>
                      </TableCell>
                      <TableCell>{user.role || '-'}</TableCell>
                      <TableCell>{user.status || '-'}</TableCell>
                      <TableCell>{user.enabled === false ? 'No' : 'Yes'}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUserId(user.id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <aside className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-extrabold text-foreground">Selected user</p>
            {!selectedUserId ? (
              <p className="mt-2 text-sm text-muted-foreground">Choose a user from the directory.</p>
            ) : selectedUserQuery.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading user detail...</p>
            ) : selectedUserQuery.isError ? (
              <p className="mt-2 text-sm text-red-700">{getFriendlyApiErrorMessage(selectedUserQuery.error, 'Failed to load user detail')}</p>
            ) : selectedUserQuery.data ? (
              <div className="mt-3 space-y-3 text-sm">
                <UserMeta label="Username" value={selectedUserQuery.data.username} />
                <UserMeta label="Email" value={selectedUserQuery.data.email} />
                <UserMeta label="Role" value={selectedUserQuery.data.role} />
                <UserMeta label="Enabled" value={selectedUserQuery.data.enabled === false ? 'No' : 'Yes'} />
                <UserMeta label="Access" value={selectedUserQuery.data.accountAccess?.status} />
                <UserMeta label="Must change password" value={selectedUserQuery.data.accountAccess?.mustChangePassword ? 'Yes' : 'No'} />

                <div className="border-t border-border pt-3">
                  <label htmlFor="temporary-password" className="text-sm font-bold text-foreground">Temporary password</label>
                  <input
                    id="temporary-password"
                    type="text"
                    value={temporaryPassword}
                    onChange={(event) => setTemporaryPassword(event.target.value)}
                    className="lms-input mt-1"
                    placeholder="New temporary password"
                  />
                  <Button type="button" className="mt-3 w-full" disabled={resetPasswordMutation.isPending} onClick={() => void resetPassword()}>
                    <KeyRound className="h-4 w-4" />
                    {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
                  </Button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
            Previous
          </Button>
          <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
          <Button type="button" variant="outline" size="sm" disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}

function UserMeta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-bold text-foreground">{value || '-'}</span>
    </div>
  )
}
