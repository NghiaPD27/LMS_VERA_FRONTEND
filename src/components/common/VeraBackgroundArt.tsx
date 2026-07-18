type VeraBackgroundArtProps = {
  variant?: 'workspace'
}

export function VeraBackgroundArt({ variant = 'workspace' }: VeraBackgroundArtProps) {
  if (variant !== 'workspace') return null

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        className="absolute -left-32 top-20 h-[620px] w-[620px] text-[hsl(var(--brand-green-soft))]"
        viewBox="0 0 620 620"
      >
        <path
          fill="currentColor"
          d="M105 380C44 288 86 154 207 88C325 24 487 53 559 164C626 268 578 422 464 512C353 600 183 498 105 380Z"
        />
      </svg>
      <svg
        className="absolute -right-40 bottom-[-180px] h-[560px] w-[760px] text-[hsl(var(--brand-orange-soft))]"
        viewBox="0 0 760 560"
      >
        <path
          fill="currentColor"
          d="M98 335C39 236 111 113 251 62C405 6 618 55 712 174C795 279 740 430 602 505C469 578 179 470 98 335Z"
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-[-1px] h-[190px] w-full text-white/55"
        viewBox="0 0 1440 210"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 126C125 163 244 185 392 169C522 154 610 98 746 83C914 65 1018 120 1166 103C1284 90 1355 45 1440 20V210H0Z"
        />
      </svg>
    </div>
  )
}
