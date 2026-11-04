import { initials, ownerPalette } from '../lib/slots'

export default function Contributors({ contributors, userId, focusedId, onFocus }) {
  if (contributors.length === 0) {
    return <p className="text-[13px] text-zinc-500">Henüz kimse slot kilitlemedi. İlk sen ol.</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {contributors.map((c) => {
        const palette = ownerPalette(c.id)
        const active = focusedId === c.id
        return (
          <button
            key={c.id}
            onClick={() => onFocus(active ? null : c.id)}
            className={`flex items-center gap-2 rounded-full border py-1 pr-2.5 pl-1 text-[12px] font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
              focusedId && !active ? 'opacity-40 hover:opacity-80' : ''
            }`}
            style={{
              borderColor: active ? palette.ring : 'rgba(255,255,255,0.07)',
              backgroundColor: active ? palette.soft : 'rgba(255,255,255,0.02)',
              boxShadow: active ? palette.glow : undefined,
            }}
            title={`${c.name} · ${c.count} slot`}
          >
            <span
              className="grid size-5 place-items-center rounded-full text-[9px] font-bold text-black/80"
              style={{ backgroundColor: palette.solid, boxShadow: palette.dotGlow }}
            >
              {initials(c.name)}
            </span>
            <span className="max-w-[9rem] truncate" style={{ color: palette.text }}>
              {c.name}
              {c.id === userId && <span className="ml-1 text-zinc-500">(sen)</span>}
            </span>
            <span className="font-mono text-[11px] text-zinc-500 tabular-nums">{c.count}</span>
          </button>
        )
      })}
    </div>
  )
}
