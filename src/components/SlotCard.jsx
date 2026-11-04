import { LoaderCircle, Lock, Plus, Undo2 } from 'lucide-react'
import { initials, slotEnd, slotStart } from '../lib/slots'

export default function SlotCard({
  index,
  row,
  ownerName,
  palette,
  isMine,
  isNow,
  isPending,
  isArmed,
  isDimmed,
  isShaking,
  onClick,
}) {
  const isHourStart = index % 3 === 0

  let cls =
    'group relative flex h-[74px] w-full flex-col justify-between overflow-hidden rounded-lg border px-2.5 py-2 text-left outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:scale-[0.96] disabled:cursor-wait'

  if (!row) {
    cls +=
      ' border-white/[0.06] bg-white/[0.015] hover:-translate-y-px hover:border-indigo-400/40 hover:bg-indigo-400/[0.04] hover:shadow-[0_0_0_1px_rgba(129,140,248,0.12),0_8px_24px_-10px_rgba(99,102,241,0.6)]'
  } else if (isArmed) {
    cls += ' border-rose-500/50 bg-rose-500/[0.08] shadow-[0_8px_28px_-10px_rgba(244,63,94,0.7)]'
  } else {
    cls += ' hover:-translate-y-px'
  }
  if (isDimmed) cls += ' opacity-30 saturate-50'
  if (isShaking) cls += ' animate-shake'

  const style =
    row && !isArmed
      ? {
          borderColor: isMine ? palette.ring : palette.border,
          backgroundImage: `linear-gradient(180deg, ${palette.tint}, transparent 85%)`,
          boxShadow: palette.glow,
        }
      : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cls}
      style={style}
      title={`${slotStart(index)} – ${slotEnd(index)} · ${row ? ownerName : 'Boş'}`}
    >
      {row && !isArmed && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px opacity-80"
          style={{ background: `linear-gradient(90deg, transparent, ${palette.solid}, transparent)` }}
        />
      )}

      <div className="flex items-center justify-between gap-1">
        <span
          className={`font-mono text-[12px] font-medium tracking-tight tabular-nums ${
            isHourStart ? 'text-zinc-100' : 'text-zinc-400'
          }`}
        >
          {slotStart(index)}
        </span>
        {isNow ? (
          <span className="flex items-center gap-1 text-[9.5px] font-semibold tracking-wider text-amber-300 uppercase">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
            </span>
            Şimdi
          </span>
        ) : (
          row && !isMine && !isArmed && <Lock size={11} className="text-zinc-600" />
        )}
      </div>

      <div key={row ? `${row.owner_id}-${isArmed}` : 'empty'} className="animate-pop min-w-0">
        {isPending ? (
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <LoaderCircle size={12} className="animate-spin" /> İşleniyor
          </span>
        ) : !row ? (
          <span className="flex items-center gap-1 text-[11px] text-zinc-600 transition-colors duration-200 group-hover:text-indigo-300">
            <Plus size={12} className="transition-transform duration-200 group-hover:rotate-90" />
            <span>Boş</span>
          </span>
        ) : isArmed ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-300">
            <Undo2 size={12} /> Bırak?
          </span>
        ) : (
          <span
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5 text-[11px] font-medium"
            style={{ borderColor: palette.border, backgroundColor: palette.soft, color: palette.text }}
          >
            <span
              className="grid size-4 shrink-0 place-items-center rounded-full text-[8px] font-bold text-black/80"
              style={{ backgroundColor: palette.solid, boxShadow: palette.dotGlow }}
            >
              {initials(ownerName)}
            </span>
            <span className="truncate">{isMine ? 'Sen' : ownerName}</span>
          </span>
        )}
      </div>
    </button>
  )
}
