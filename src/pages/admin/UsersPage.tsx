import React, { useState } from 'react'
import { KeyRound, RefreshCw, Search, ShieldCheck, UserPlus } from 'lucide-react'
import { CreateUserForm } from '../../components/users/CreateUserForm'
import { UserStatusForm } from '../../components/users/UserStatusForm'
import { UserRoleBadge } from '../../components/users/UserRoleBadge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const tabs = [
  { key: 'student', label: 'Create Student' },
  { key: 'teacher', label: 'Create Teacher' },
  { key: 'evaluator', label: 'Create Evaluator' },
  { key: 'status', label: 'Update Status' },
] as const

type UserTab = (typeof tabs)[number]['key']

export const UsersPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25 sm:flex">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="lms-section-title">User & Account Management</h1>
                <p className="lms-section-description">
                  Manage platform users, create new student/teacher/evaluator accounts, and handle password resets.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary font-bold text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.35)] shrink-0"
              data-testid="open-create-user-modal"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create / Manage User
            </Button>
          </div>
        </div>
      </div>

      <div className="lms-surface p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">User Directory</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Search accounts, inspect access state, and reset temporary passwords.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${usersQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_160px_160px_auto] md:items-end">
          <div>
            <label htmlFor="admin-user-search" className="text-xs font-bold text-zinc-300">Search</label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-user-search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setPage(0)
                }}
                className="lms-input pl-9 text-xs"
                placeholder="Username or email"
              />
            </div>
          </div>
          <div>
            <label htmlFor="admin-user-role" className="text-xs font-bold text-zinc-300">Role</label>
            <select id="admin-user-role" value={role} onChange={(event) => { setRole(event.target.value); setPage(0) }} className="lms-input mt-1 text-xs">
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="EVALUATOR">EVALUATOR</option>
            </select>
          </div>
          <div>
            <label htmlFor="admin-user-status" className="text-xs font-bold text-zinc-300">Status</label>
            <select id="admin-user-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0) }} className="lms-input mt-1 text-xs">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setKeyword('')
              setRole('')
              setStatus('')
              setPage(0)
            }}
          >
            Clear Filters
          </Button>
        </div>

        {message && <div className="mb-4 lms-alert-success">{message}</div>}
        {error && <div className="mb-4 lms-alert-error">{error}</div>}

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-xl border border-border/80 bg-slate-900/60">
            {usersQuery.isLoading ? (
              <LoadingState message="Loading users..." />
            ) : usersQuery.isError ? (
              <div className="m-4 lms-alert-error">{getFriendlyApiErrorMessage(usersQuery.error, 'Failed to load users')}</div>
            ) : users.length === 0 ? (
              <EmptyState message="No users found" description="Adjust filters or create a new account." />
            ) : (
              <Table className="w-full text-left border-collapse">
                <TableHeader className="bg-slate-900/90 border-b border-border/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-bold text-xs py-3 px-3.5">User</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs py-3 px-3.5">Role</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs py-3 px-3.5">Status</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs py-3 px-3.5">Enabled</TableHead>
                    <TableHead className="text-right text-zinc-400 font-bold text-xs py-3 px-3.5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {users.map((user) => (
                    <TableRow key={user.id} className={`transition-colors ${selectedUserId === user.id ? 'bg-primary/15 hover:bg-primary/20' : 'hover:bg-slate-900/80'}`}>
                      <TableCell className="py-3 px-3.5">
                        <p className="font-bold text-white text-xs whitespace-nowrap">{user.username || `User #${user.id}`}</p>
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">{user.email || '-'}</p>
                      </TableCell>
                      <TableCell className="py-3 px-3.5 whitespace-nowrap">
                        <UserRoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="text-xs font-medium text-zinc-300 py-3 px-3.5 whitespace-nowrap">{user.status || '-'}</TableCell>
                      <TableCell className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          user.enabled === false
                            ? 'border-rose-500/30 bg-rose-950/60 text-rose-400'
                            : 'border-emerald-500/30 bg-emerald-950/60 text-emerald-400'
                        }`}>
                          {user.enabled === false ? 'Disabled' : 'Enabled'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3 px-3.5 whitespace-nowrap">
                        <Button type="button" variant="outline" size="sm" className="h-7 px-3 text-xs border-border hover:border-primary/50 hover:bg-slate-800" onClick={() => setSelectedUserId(user.id)}>
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <aside className="rounded-xl border border-border/80 bg-slate-900/60 p-4">
            <p className="text-sm font-extrabold text-white mb-2">Selected User Detail</p>
            {!selectedUserId ? (
              <p className="text-xs text-muted-foreground">Choose a user from the directory to inspect.</p>
            ) : selectedUserQuery.isLoading ? (
              <p className="text-xs text-muted-foreground">Loading user detail...</p>
            ) : selectedUserQuery.isError ? (
              <p className="text-xs text-rose-400">{getFriendlyApiErrorMessage(selectedUserQuery.error, 'Failed to load user detail')}</p>
            ) : selectedUserQuery.data ? (
              <div className="space-y-3 text-xs">
                <UserMeta label="Username" value={selectedUserQuery.data.username} />
                <UserMeta label="Email" value={selectedUserQuery.data.email} />
                <div className="flex justify-between items-center gap-3">
                  <span className="text-muted-foreground">Role</span>
                  <UserRoleBadge role={selectedUserQuery.data.role} />
                </div>
                <UserMeta label="Enabled" value={selectedUserQuery.data.enabled === false ? 'No' : 'Yes'} />
                <UserMeta label="Access" value={selectedUserQuery.data.accountAccess?.status} />
                <UserMeta label="Must change password" value={selectedUserQuery.data.accountAccess?.mustChangePassword ? 'Yes' : 'No'} />

                <div className="border-t border-border/60 pt-3 mt-3 space-y-2">
                  <label htmlFor="temporary-password" className="text-xs font-bold text-zinc-300">Temporary Password</label>
                  <input
                    id="temporary-password"
                    type="text"
                    value={temporaryPassword}
                    onChange={(event) => setTemporaryPassword(event.target.value)}
                    className="lms-input text-xs"
                    placeholder="New temporary password"
                  />
                  <Button type="button" className="w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_15px_rgba(244,106,37,0.3)] text-xs" disabled={resetPasswordMutation.isPending} onClick={() => void resetPassword()}>
                    <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                    {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
            Previous
          </Button>
          <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
          <Button type="button" variant="outline" size="sm" disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>

      {/* Modal Popup for Account Creation & Status Management */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl bg-[hsl(220_14%_10%)] border-border text-foreground p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>Create / Manage Accounts</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select account type to provision new users or update account status.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Tab Switcher */}
          <div className="flex border-b border-border/60 gap-2 mb-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                data-testid={`tab-${tab.key}`}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-primary text-primary font-extrabold'
                    : 'border-transparent text-muted-foreground hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {activeTab === 'student' && <CreateUserForm role="student" />}
            {activeTab === 'teacher' && <CreateUserForm role="teacher" />}
            {activeTab === 'evaluator' && <CreateUserForm role="evaluator" />}
            {activeTab === 'status' && <UserStatusForm />}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function UserMeta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-bold text-white">{value || '-'}</span>
    </div>
  )
}
