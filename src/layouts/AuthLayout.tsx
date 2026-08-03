import { Outlet } from 'react-router-dom'
import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react'
import { NoIndexSeo } from '../components/common/Seo'

export function AuthLayout() {
  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-y-auto overflow-x-hidden bg-[hsl(220_14%_7%)] px-4 py-6 text-foreground lg:overflow-hidden">
      <NoIndexSeo title="Vera Language | Account access" />
      
      {/* Dark Ambient Radial Glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 -z-10 h-[500px] w-[500px] rounded-full bg-orange-600/10 blur-[120px]" />

      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-[hsl(220_14%_10%)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:h-[calc(100dvh-3rem)] lg:max-h-[700px] lg:grid-cols-[0.95fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-b from-slate-900 via-[hsl(220_14%_11%)] to-slate-950 p-8 text-foreground border-r border-border lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_20px_rgba(244,106,37,0.4)]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-bold text-white tracking-tight">Vera Language</p>
                <p className="text-xs font-medium text-muted-foreground">Language learning portal</p>
              </div>
            </div>

            <div className="mt-12 max-w-md">
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                English & Vietnamese
              </p>
              <h1 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
                Clear language learning, without the friction.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                A focused workspace for learners to sign in, continue lessons, and follow active learning paths.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-3">
            <div className="rounded-xl border border-border bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
              <p className="font-bold text-white text-sm">Secure Access</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">First-time password updates apply to admin-created accounts.</p>
            </div>
            <div className="rounded-xl border border-border bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm">
              <BookOpen className="mb-2 h-5 w-5 text-primary" />
              <p className="font-bold text-white text-sm">Role-based Workspaces</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">After sign-in, Vera routes you directly to your workspace.</p>
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center bg-[hsl(220_14%_9%)] px-5 py-8 sm:px-8 lg:h-full lg:px-10">
          <Outlet />
        </div>
      </section>
    </main>
  )
}
