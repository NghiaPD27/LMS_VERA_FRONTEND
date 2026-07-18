import React, { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { CreateUserForm } from '../../components/users/CreateUserForm'
import { ExtendAccountForm } from '../../components/users/ExtendAccountForm'
import { UserStatusForm } from '../../components/users/UserStatusForm'

const tabs = [
  { key: 'student', label: 'Create Student' },
  { key: 'teacher', label: 'Create Teacher' },
  { key: 'evaluator', label: 'Create Evaluator' },
  { key: 'status', label: 'Update Status' },
  { key: 'extend', label: 'Extend Account' },
] as const

type UserTab = (typeof tabs)[number]['key']

export const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserTab>('student')

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
                Create users, update access status, and extend student accounts.
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
          {activeTab === 'extend' && <ExtendAccountForm />}
        </main>
      </div>
    </section>
  )
}
