import { TOTAL_SLOTS, withPossessive } from '../lib/slots'

export default function ProgressBar({ filled }) {
  const ratio = filled / TOTAL_SLOTS
  const percent = Math.floor(ratio * 100)

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <p className="flex-1 text-[13px] text-zinc-400 sm:flex-none">
        <span className="font-medium text-zinc-100 tabular-nums">
          {TOTAL_SLOTS} slotun {withPossessive(filled)}
        </span>{' '}
        kilitlendi
      </p>

      <span className="font-mono text-[13px] font-medium text-zinc-100 tabular-nums sm:order-last sm:w-11 sm:text-right">
        %{percent}
      </span>

      <div
        className="relative order-last h-1.5 w-full rounded-full bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)] sm:order-none sm:w-auto sm:flex-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_SLOTS}
        aria-valuenow={filled}
        aria-label={`${TOTAL_SLOTS} slotun ${withPossessive(filled)} kilitlendi`}
      >
        <div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.7),0_0_28px_-4px_rgba(236,72,153,0.6)] transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${ratio * 100}%` }}
        >
          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
        {filled > 0 && (
          <div
            className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200 shadow-[0_0_10px_3px_rgba(236,72,153,0.8)] transition-[left] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: `${ratio * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}
