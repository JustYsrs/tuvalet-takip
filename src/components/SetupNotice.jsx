export default function SetupNotice({ error }) {
  return (
    <div className="grid min-h-svh place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-ink-900 p-6 text-[13.5px] text-zinc-400 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]">
        <h1 className="mb-3 text-[17px] font-semibold tracking-tight text-white">Supabase bağlantısı kurulamadı</h1>
        {error && (
          <p className="mb-4 rounded-lg border border-rose-500/25 bg-rose-500/[0.06] p-3 font-mono text-[12px] text-rose-300">
            {error.message}
          </p>
        )}
        <ol className="list-decimal space-y-1.5 pl-5 marker:text-zinc-600">
          <li>
            <code className="text-zinc-200">.env</code> dosyasında URL ve anahtarın doğru olduğundan emin olun.
          </li>
          <li>
            Supabase SQL Editor'da <code className="text-zinc-200">supabase/schema.sql</code> dosyasını çalıştırın.
          </li>
          <li>
            Authentication ayarlarında <span className="text-zinc-200">Anonymous sign-ins</span> seçeneğini açın.
          </li>
          <li>Geliştirme sunucusunu yeniden başlatın.</li>
        </ol>
      </div>
    </div>
  )
}
