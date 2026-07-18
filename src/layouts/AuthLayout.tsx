import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--brand-green))] px-4 py-10">
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] -z-10 h-[38%] w-full text-[hsl(var(--brand-orange-soft))]"
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
        className="pointer-events-none absolute -right-24 top-16 -z-10 h-[360px] w-[620px] text-[hsl(var(--brand-green-soft))]"
        viewBox="0 0 620 360"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M75 215C35 158 79 77 166 38C270 -9 411 5 516 68C598 117 630 205 574 274C517 344 392 361 275 331C180 307 114 270 75 215Z"
        />
      </svg>
      <Outlet />
    </main>
  )
}
