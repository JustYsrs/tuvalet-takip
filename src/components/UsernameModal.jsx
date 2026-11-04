import { ArrowRight, Toilet, X } from 'lucide-react'
import { useState } from 'react'

export default function UsernameModal({ initialName = '', onSave, onClose }) {
  const [name, setName] = useState(initialName)
  const trimmed = name.trim()
  const valid = trimmed.length >= 2 && trimmed.length <= 24

  function handleSubmit(e) {
    e.preventDefault()
    if (valid) onSave(trimmed)
  }

  return (
    <div className="animate-fade-up fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm [animation-duration:0.25s]">
      <form
        onSubmit={handleSubmit}
        className="animate-pop relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl"
        />

        <div className="relative p-6">
          {onClose && (
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
            <Toilet size={18} className="text-zinc-100" />
          </div>
          <h2 className="text-[17px] font-semibold tracking-tight text-white">
            {onClose ? 'Görünen adını değiştir' : 'Tabloya katıl'}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
            Kilitlediğin slotlarda bu isim görünecek. Sadece bu cihazda saklanır.
          </p>

          <label className="mt-5 block text-[12px] font-medium text-zinc-300" htmlFor="username">
            Kullanıcı adı
          </label>
          <input
            id="username"
            autoFocus
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="örn. Hato"
            className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 text-[14px] text-white placeholder:text-zinc-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] outline-none transition focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/15"
          />
          <p className="mt-1.5 text-[11.5px] text-zinc-600">2–24 karakter</p>

          <button
            type="submit"
            disabled={!valid}
            className="group mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[13.5px] font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-8px_rgba(255,255,255,0.35)] transition-all duration-200 enabled:hover:bg-zinc-200 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {onClose ? 'Kaydet' : 'Devam et'}
            <ArrowRight size={14} className="transition-transform duration-200 group-enabled:group-hover:translate-x-0.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
