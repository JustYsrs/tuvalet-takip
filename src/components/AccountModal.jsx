import { ArrowRight, Check, LoaderCircle, Lock, Palette, Settings, Toilet, Trash, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COLOR_PRESETS, initials, ownerPalette } from '../lib/slots'

const CONFIRM_TIMEOUT_MS = 3000

function SectionLabel({ children }) {
  return <p className="mb-2 text-[12px] font-medium text-zinc-300">{children}</p>
}

export default function AccountModal({
  mode,
  userId,
  initialName = '',
  initialHue,
  mineCount = 0,
  profilesAvailable = true,
  onSave,
  onReleaseAll,
  onClose,
}) {
  const isOnboarding = mode === 'onboarding'
  const [name, setName] = useState(initialName)
  const [hue, setHue] = useState(initialHue)
  const [saving, setSaving] = useState(false)
  const [confirmRelease, setConfirmRelease] = useState(false)
  const [releasing, setReleasing] = useState(false)

  const trimmed = name.trim()
  const valid = trimmed.length >= 2 && trimmed.length <= 24
  const dirty = trimmed !== initialName.trim() || hue !== initialHue
  const palette = ownerPalette(userId ?? trimmed, hue)

  useEffect(() => {
    if (!confirmRelease) return
    const timer = setTimeout(() => setConfirmRelease(false), CONFIRM_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [confirmRelease])

  useEffect(() => {
    if (isOnboarding) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOnboarding, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    await onSave({ name: trimmed, hue })
    setSaving(false)
  }

  async function handleReleaseAll() {
    if (!confirmRelease) {
      setConfirmRelease(true)
      return
    }
    setConfirmRelease(false)
    setReleasing(true)
    await onReleaseAll()
    setReleasing(false)
  }

  return (
    <div
      className="animate-fade-up fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm [animation-duration:0.25s]"
      onMouseDown={(e) => !isOnboarding && e.target === e.currentTarget && onClose?.()}
    >
      <form
        onSubmit={handleSubmit}
        className="animate-pop relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-500"
          style={{ backgroundColor: `hsl(${palette.hue} 85% 55% / 0.25)` }}
        />

        <div className="relative p-6">
          {!isOnboarding && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
              aria-label="Kapat"
            >
              <X size={15} />
            </button>
          )}

          <div className="mb-5 grid size-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            {isOnboarding ? <Toilet size={18} className="text-zinc-100" /> : <Settings size={18} className="text-zinc-100" />}
          </div>
          <h2 className="text-[17px] font-semibold tracking-tight text-white">
            {isOnboarding ? 'Tabloya katıl' : 'Hesap ayarları'}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
            {isOnboarding
              ? 'Adını ve rozet rengini seç. Kilitlediğin slotlarda herkes bunu görecek.'
              : 'Adın ve rengin tüm slotlarında, herkesin ekranında anında güncellenir.'}
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3">
            <div
              className="relative flex h-[74px] w-[104px] shrink-0 flex-col justify-between overflow-hidden rounded-lg border px-2.5 py-2 transition-all duration-300"
              style={{
                borderColor: palette.ring,
                backgroundImage: `linear-gradient(180deg, ${palette.tint}, transparent 85%)`,
                boxShadow: palette.glow,
              }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${palette.solid}, transparent)` }}
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-medium text-zinc-100 tabular-nums">08:20</span>
                <Lock size={11} className="text-zinc-600" />
              </div>
              <span
                className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full border py-0.5 pr-2 pl-0.5 text-[11px] font-medium"
                style={{ borderColor: palette.border, backgroundColor: palette.soft, color: palette.text }}
              >
                <span
                  className="grid size-4 shrink-0 place-items-center rounded-full text-[8px] font-bold text-black/80"
                  style={{ backgroundColor: palette.solid, boxShadow: palette.dotGlow }}
                >
                  {initials(trimmed)}
                </span>
                <span className="truncate">{trimmed || 'Adın'}</span>
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-500">
              Diğerleri senin kartlarını böyle görecek.
            </p>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-[12px] font-medium text-zinc-300" htmlFor="display-name">
              Görünen ad
            </label>
            <input
              id="display-name"
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="örn. Hato"
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 text-[14px] text-white placeholder:text-zinc-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] outline-none transition focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
            />
            <p className="mt-1.5 text-[11.5px] text-zinc-600">2–24 karakter</p>
          </div>

          <div className="mt-4">
            <SectionLabel>Rozet rengi</SectionLabel>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((c) => {
                const selected = hue === c.hue
                return (
                  <button
                    key={c.hue}
                    type="button"
                    onClick={() => setHue(c.hue)}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={selected}
                    className={`grid aspect-square place-items-center rounded-full border transition-all duration-200 hover:scale-110 active:scale-95 ${
                      selected ? 'scale-110 border-white/70' : 'border-white/10'
                    }`}
                    style={{
                      backgroundColor: `hsl(${c.hue} 85% 62%)`,
                      boxShadow: selected ? `0 0 16px hsl(${c.hue} 90% 60% / 0.7)` : undefined,
                    }}
                  >
                    {selected && <Check size={14} strokeWidth={3} className="text-black/75" />}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Palette size={14} className="shrink-0 text-zinc-500" />
              <input
                type="range"
                min={0}
                max={359}
                value={hue ?? palette.hue}
                onChange={(e) => setHue(Number(e.target.value))}
                aria-label="Özel renk tonu"
                className="hue-slider h-2 flex-1"
              />
              <span className="w-9 text-right font-mono text-[11px] text-zinc-500 tabular-nums">{hue ?? palette.hue}°</span>
            </div>
          </div>

          {!profilesAvailable && (
            <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[12px] leading-relaxed text-amber-200/90">
              Renk şimdilik yalnızca sende görünür. Herkese görünmesi için Supabase'de güncel{' '}
              <code className="text-amber-100">supabase/schema.sql</code> dosyasını yeniden çalıştır.
            </p>
          )}

          <button
            type="submit"
            disabled={!valid || saving || (!isOnboarding && !dirty)}
            className="group mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[13.5px] font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(255,255,255,0.35)] transition-all duration-200 enabled:hover:bg-zinc-200 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <>
                {isOnboarding ? 'Devam et' : 'Değişiklikleri kaydet'}
                <ArrowRight size={14} className="transition-transform duration-200 group-enabled:group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          {!isOnboarding && (
            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12.5px] font-medium text-zinc-200">Slotlarımı bırak</p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    Kilitlediğin <span className="font-mono text-zinc-300 tabular-nums">{mineCount}</span> slotun tamamı boşa çıkar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReleaseAll}
                  disabled={mineCount === 0 || releasing}
                  className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
                    confirmRelease
                      ? 'border-rose-500/60 bg-rose-500/15 text-rose-200 shadow-[0_0_20px_-6px_rgba(244,63,94,0.8)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:border-rose-500/40 hover:text-rose-300'
                  }`}
                >
                  {releasing ? <LoaderCircle size={13} className="animate-spin" /> : <Trash size={13} />}
                  {confirmRelease ? 'Emin misin?' : 'Bırak'}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
