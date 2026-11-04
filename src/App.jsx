import { PartyPopper, RotateCcw, Settings, Shuffle, Toilet } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AccountModal from './components/AccountModal'
import Contributors from './components/Contributors'
import ProgressBar from './components/ProgressBar'
import SetupNotice from './components/SetupNotice'
import SlotCard from './components/SlotCard'
import Toasts from './components/Toasts'
import { useSlots } from './hooks/useSlots'
import { useToasts } from './hooks/useToasts'
import { isDemo } from './lib/backend'
import { fillDemoRandomly, resetDemo } from './lib/demoBackend'
import {
  currentSlotIndex,
  defaultHue,
  HOURS,
  initials,
  ownerPalette,
  slotEnd,
  slotStart,
  TOTAL_SLOTS,
} from './lib/slots'

const NAME_KEY = 'tuvalet-takip:username'
const ARM_TIMEOUT_MS = 3000
const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'empty', label: 'Boş' },
  { id: 'mine', label: 'Benim' },
]

function Backdrop({ children }) {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-ink-950">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(99,102,241,0.22),transparent_70%)]" />
        <div className="absolute top-[-120px] left-[15%] size-[420px] rounded-full bg-purple-600/10 blur-[110px]" />
        <div className="absolute top-[30%] right-[-120px] size-[380px] rounded-full bg-pink-600/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      </div>
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Backdrop>
      <Board />
    </Backdrop>
  )
}

function StatusPill({ status }) {
  const map = {
    live: { dot: 'bg-emerald-400', ping: true, label: 'Canlı', text: 'text-zinc-300' },
    offline: { dot: 'bg-amber-400', ping: false, label: 'Bağlantı koptu', text: 'text-amber-300' },
    connecting: { dot: 'bg-zinc-500', ping: true, label: 'Bağlanıyor', text: 'text-zinc-400' },
  }
  const s = map[status] ?? map.connecting
  return (
    <span className={`flex h-7 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 text-[12px] font-medium ${s.text}`}>
      <span className="relative flex size-1.5">
        {s.ping && <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-70 ${s.dot}`} />}
        <span className={`relative inline-flex size-1.5 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[11.5px] font-medium text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-[22px] font-semibold tracking-tight tabular-nums ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

function FilterTabs({ value, onChange }) {
  const activeIndex = FILTERS.findIndex((f) => f.id === value)
  return (
    <div className="relative grid grid-cols-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md border border-white/[0.08] bg-white/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`relative z-10 h-7 px-3 text-[12px] font-medium transition-colors duration-200 ${
            value === f.id ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function GhostButton({ icon: Icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-[12px] font-medium text-zinc-400 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-zinc-100 active:scale-95"
    >
      <Icon size={13} /> {children}
    </button>
  )
}

function Board() {
  const [username, setUsername] = useState(() => localStorage.getItem(NAME_KEY) ?? '')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pending, setPending] = useState(() => new Set())
  const [armed, setArmed] = useState(null)
  const [shaking, setShaking] = useState(null)
  const [focusedId, setFocusedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [nowIndex, setNowIndex] = useState(() => currentSlotIndex())

  const {
    userId,
    ready,
    slots,
    profiles,
    profilesAvailable,
    status,
    error,
    claim,
    release,
    releaseAll,
    saveProfile,
  } = useSlots()
  const { toasts, push, dismiss } = useToasts()

  useEffect(() => {
    const timer = setInterval(() => setNowIndex(currentSlotIndex()), 30_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (armed === null) return
    const timer = setTimeout(() => setArmed(null), ARM_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [armed])

  useEffect(() => {
    if (shaking === null) return
    const timer = setTimeout(() => setShaking(null), 400)
    return () => clearTimeout(timer)
  }, [shaking])

  const ownerOf = useCallback(
    (ownerId, fallbackName) => {
      const profile = profiles.get(ownerId)
      const name = (ownerId === userId && username) || profile?.display_name || fallbackName || 'Anonim'
      return { name, palette: ownerPalette(ownerId, profile?.hue ?? undefined) }
    },
    [profiles, userId, username],
  )

  const contributors = useMemo(() => {
    const byOwner = new Map()
    for (const row of slots?.values() ?? []) {
      const entry = byOwner.get(row.owner_id)
      if (!entry) byOwner.set(row.owner_id, { id: row.owner_id, fallback: row.owner_name, count: 1, last: row.claimed_at })
      else {
        entry.count++
        if (row.claimed_at > entry.last) Object.assign(entry, { fallback: row.owner_name, last: row.claimed_at })
      }
    }
    return [...byOwner.values()]
      .map((c) => ({ ...c, ...ownerOf(c.id, c.fallback) }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'tr'))
  }, [slots, ownerOf])

  const mineCount = contributors.find((c) => c.id === userId)?.count ?? 0
  const filled = slots.size
  const myProfile = userId ? profiles.get(userId) : null
  const myHue = myProfile?.hue ?? (userId ? defaultHue(userId) : undefined)

  async function handleSaveAccount({ name, hue }) {
    const isFirstTime = !username
    localStorage.setItem(NAME_KEY, name)
    setUsername(name)
    const result = await saveProfile({ displayName: name, hue })
    setSettingsOpen(false)
    if (result.ok) {
      if (!isFirstTime) push('success', 'Hesap güncellendi', 'Adın ve rengin herkesin ekranında yenilendi.')
    } else if (result.missingTable) {
      push('warning', 'Renk sadece sende görünür', "Herkese görünmesi için supabase/schema.sql'i yeniden çalıştır.")
    } else {
      push('error', 'Ayarlar kaydedilemedi', result.message)
    }
  }

  async function handleReleaseAll() {
    const result = await releaseAll()
    if (result.ok) push('info', 'Slotların bırakıldı', `${result.count} slot tekrar boşta.`)
    else push('error', 'İşlem başarısız', result.message)
  }

  const setSlotPending = useCallback((index, on) => {
    setPending((prev) => {
      const next = new Set(prev)
      if (on) next.add(index)
      else next.delete(index)
      return next
    })
  }, [])

  async function handleSlotClick(index) {
    if (pending.has(index) || !userId) return
    const row = slots.get(index)
    const range = `${slotStart(index)} – ${slotEnd(index)}`

    if (!row) {
      setArmed(null)
      setSlotPending(index, true)
      const result = await claim(index, username)
      setSlotPending(index, false)
      if (result.ok) push('success', 'Slot kilitlendi', `${range} artık senin.`)
      else if (result.reason === 'taken') push('warning', 'Slot az önce alındı', 'Biri bu bloğu senden hemen önce kilitledi.')
      else push('error', 'İşlem başarısız', result.message)
      return
    }

    if (row.owner_id !== userId) {
      setShaking(index)
      push('warning', 'Bu slot sana ait değil', `${range} bloğunu ${ownerOf(row.owner_id, row.owner_name).name} kilitledi. Sadece o geri bırakabilir.`)
      return
    }

    if (armed !== index) {
      setArmed(index)
      return
    }

    setArmed(null)
    setSlotPending(index, true)
    const result = await release(index)
    setSlotPending(index, false)
    if (result.ok) push('info', 'Slot serbest bırakıldı', `${range} tekrar boşta.`)
    else if (result.reason === 'forbidden') push('warning', 'Yetkin yok', 'Bu slotu yalnızca sahibi bırakabilir.')
    else push('error', 'İşlem başarısız', result.message)
  }

  function isDimmed(row) {
    if (focusedId && row?.owner_id !== focusedId) return true
    if (filter === 'empty') return Boolean(row)
    if (filter === 'mine') return !row || row.owner_id !== userId
    return false
  }

  if (status === 'error') return <SetupNotice error={error} />

  const myPalette = userId ? ownerPalette(userId, myHue) : null

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-gradient-to-b from-white/[0.12] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Toilet size={14} className="text-zinc-100" />
              </div>
              <span className="truncate text-[14px] font-semibold tracking-tight text-zinc-100">Tuvalet Blokları</span>
              <span className="hidden text-zinc-700 sm:inline">/</span>
              <span className="hidden text-[13px] text-zinc-500 sm:inline">24 saat · 72 slot</span>
              {isDemo && (
                <span className="rounded-md border border-purple-400/25 bg-purple-500/10 px-1.5 py-0.5 text-[10.5px] font-medium text-purple-300">
                  Demo
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <StatusPill status={status} />
              {username && myPalette && (
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="group flex h-7 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] pr-2.5 pl-0.5 text-[12.5px] font-medium text-zinc-200 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.06] active:scale-95"
                  title="Hesap ayarları"
                >
                  <span
                    className="grid size-6 place-items-center rounded-full text-[9.5px] font-bold text-black/80"
                    style={{ backgroundColor: myPalette.solid, boxShadow: myPalette.dotGlow }}
                  >
                    {initials(username)}
                  </span>
                  <span className="hidden max-w-[8rem] truncate sm:inline">{username}</span>
                  <Settings
                    size={12}
                    className="text-zinc-500 transition-all duration-300 group-hover:rotate-90 group-hover:text-zinc-200"
                  />
                </button>
              )}
            </div>
          </div>
          <div className="pb-3">
            <ProgressBar filled={filled} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-28 sm:px-6 sm:pt-14">
        <section className="animate-fade-up">
          <h1 className="text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[52px]">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">24 saat, 72 blok.</span>
            <br />
            <span className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-transparent">
              Hep birlikte dolduruyoruz.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-zinc-400">
            Her kart 20 dakikalık bir dilim. Boş bir karta dokun, o saat sana kilitlensin. Kilitlediğin kartı yalnızca sen
            geri bırakabilirsin.
          </p>
        </section>

        {filled === TOTAL_SLOTS && (
          <div className="animate-fade-up mt-8 flex items-center gap-3 rounded-xl border border-purple-400/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-4 py-3 text-[13.5px] text-zinc-200 shadow-[0_8px_40px_-12px_rgba(168,85,247,0.6)]">
            <PartyPopper size={16} className="shrink-0 text-pink-300" />
            Tablo tamamlandı. 24 saatin tamamı imece usulü kilitlendi.
          </div>
        )}

        <section className="animate-fade-up mt-10 grid grid-cols-2 gap-2 [animation-delay:80ms] sm:grid-cols-4 sm:gap-3">
          <Stat label="Kilitli" value={filled} />
          <Stat label="Boş" value={TOTAL_SLOTS - filled} />
          <Stat label="Senin" value={mineCount} accent="text-purple-300" />
          <Stat label="Katılımcı" value={contributors.length} />
        </section>

        <section className="animate-fade-up mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 [animation-delay:140ms]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[12.5px] font-medium text-zinc-300">Katkıda bulunanlar</h2>
            {focusedId && (
              <button
                onClick={() => setFocusedId(null)}
                className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
              >
                Filtreyi temizle
              </button>
            )}
          </div>
          <Contributors contributors={contributors} userId={userId} focusedId={focusedId} onFocus={setFocusedId} />
        </section>

        <section className="animate-fade-up mt-12 [animation-delay:200ms]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-zinc-100">Zaman çizelgesi</h2>
              <span className="font-mono text-[12px] text-zinc-600 tabular-nums">00:00 – 24:00</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isDemo && (
                <>
                  <GhostButton icon={Shuffle} onClick={fillDemoRandomly}>
                    Doldur
                  </GhostButton>
                  <GhostButton icon={RotateCcw} onClick={resetDemo}>
                    Sıfırla
                  </GhostButton>
                </>
              )}
              <FilterTabs value={filter} onChange={setFilter} />
            </div>
          </div>

          {!ready ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {HOURS.map(({ hour }) => (
                <div key={hour}>
                  <div className="mb-2 h-3 w-10 rounded bg-white/[0.04]" />
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-[74px] animate-pulse rounded-lg border border-white/[0.04] bg-white/[0.02]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {HOURS.map(({ hour, slots: indices }) => {
                const filledInHour = indices.filter((i) => slots.has(i)).length
                const label = `${String(hour).padStart(2, '0')}:00`
                return (
                  <div key={hour}>
                    <div className="mb-2 flex items-center gap-2 px-0.5">
                      <span
                        className={`font-mono text-[11px] font-medium tabular-nums ${
                          hour === Math.floor(nowIndex / 3) ? 'text-amber-300' : 'text-zinc-500'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
                      <span
                        className={`font-mono text-[10.5px] tabular-nums ${
                          filledInHour === 3 ? 'text-purple-300' : 'text-zinc-600'
                        }`}
                      >
                        {filledInHour}/3
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {indices.map((i) => {
                        const row = slots.get(i)
                        const owner = row ? ownerOf(row.owner_id, row.owner_name) : null
                        return (
                          <SlotCard
                            key={i}
                            index={i}
                            row={row}
                            ownerName={owner?.name}
                            palette={owner?.palette}
                            isMine={Boolean(row && row.owner_id === userId)}
                            isNow={i === nowIndex}
                            isPending={pending.has(i)}
                            isArmed={armed === i}
                            isDimmed={isDimmed(row)}
                            isShaking={shaking === i}
                            onClick={() => handleSlotClick(i)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-6 text-[12px] text-zinc-600">
          <span>Değişiklikler herkesin ekranında anında güncellenir.</span>
          <span className="font-mono tabular-nums">
            {filled}/{TOTAL_SLOTS}
          </span>
        </footer>
      </main>

      <Toasts toasts={toasts} onDismiss={dismiss} />

      {(!username || settingsOpen) && (
        <AccountModal
          key={username ? 'settings' : 'onboarding'}
          mode={username ? 'settings' : 'onboarding'}
          userId={userId}
          initialName={username}
          initialHue={myHue}
          mineCount={mineCount}
          profilesAvailable={profilesAvailable}
          onSave={handleSaveAccount}
          onReleaseAll={handleReleaseAll}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  )
}
