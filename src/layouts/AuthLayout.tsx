import { Outlet } from 'react-router-dom'
import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-y-auto overflow-x-hidden bg-[hsl(var(--brand-green-soft))] px-4 py-4 text-foreground lg:overflow-hidden">
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] -z-10 h-[34%] w-full text-white"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 132C124 169 231 201 365 190C511 178 606 113 744 93C905 70 1004 121 1147 105C1267 91 1350 45 1440 15V260H0Z"
        />
      </svg>
      <svg
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-[360px] w-[620px] text-[hsl(var(--brand-orange-soft))]"
        viewBox="0 0 620 360"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M75 215C35 158 79 77 166 38C270 -9 411 5 516 68C598 117 630 205 574 274C517 344 392 361 275 331C180 307 114 270 75 215Z"
        />
      </svg>
      <svg
        className="pointer-events-none absolute -right-24 bottom-24 -z-10 hidden h-[300px] w-[520px] text-[hsl(var(--brand-green))]/10 lg:block"
        viewBox="0 0 520 300"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M36 164C15 96 82 26 182 12C300 -5 427 25 488 96C548 166 518 247 410 280C300 314 203 273 126 238C77 216 49 202 36 164Z"
        />
      </svg>

      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(27,89,56,0.14)] backdrop-blur lg:h-[calc(100dvh-2rem)] lg:max-h-[700px] lg:grid-cols-[0.9fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-[hsl(var(--brand-orange-soft))] p-8 text-foreground lg:flex lg:flex-col lg:justify-between">
          <div
            className="absolute -right-20 -top-20 h-64 w-80 bg-white/70"
            style={{ clipPath: 'polygon(8% 18%, 92% 0, 100% 74%, 45% 100%, 0 70%)' }}
          />
          <div
            className="absolute -bottom-16 left-8 h-52 w-72 bg-[hsl(var(--brand-green-soft))]"
            style={{ clipPath: 'polygon(18% 0, 100% 20%, 88% 86%, 32% 100%, 0 54%)' }}
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[hsl(var(--brand-green))] shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold">LMS Vera</p>
                <p className="text-xs font-semibold text-muted-foreground">Language learning portal</p>
              </div>
            </div>

            <div className="mt-12 max-w-md">
              <p className="mb-4 inline-flex rounded-full border border-[hsl(var(--brand-green))]/20 bg-white px-3 py-1 text-sm font-bold text-[hsl(var(--brand-green))]">
                English and Vietnamese
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-foreground">
                Clear language learning, without the heavy entry point.
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                A focused portal for learners to sign in, continue lessons, and follow their active courses.
              </p>
            </div>
          </div>

          <div className="relative grid gap-3">
            <div className="rounded-lg border border-[hsl(var(--brand-green))]/15 bg-white/80 p-4 shadow-sm">
              <ShieldCheck className="mb-3 h-5 w-5 text-[hsl(var(--brand-green))]" />
              <p className="font-bold text-foreground">Secure accounts</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">First-time password changes only apply to admin-created accounts.</p>
            </div>
            <div className="rounded-lg border border-primary/15 bg-white/80 p-4 shadow-sm">
              <BookOpen className="mb-3 h-5 w-5 text-primary" />
              <p className="font-bold text-foreground">Your right learning space</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">After sign-in, Vera takes each user to the correct workspace for their role.</p>
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center px-5 py-6 sm:px-8 lg:h-full lg:px-10">
          <Outlet />
        </div>
      </section>
    </main>
  )
}
