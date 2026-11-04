import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured ? createClient(url, key) : null

let sessionPromise = null

/** Tarayıcı başına tek bir anonim Supabase kullanıcısı; slot sahipliği bu kimliğe bağlıdır. */
export function ensureSession() {
  sessionPromise ??= (async () => {
    const { data } = await supabase.auth.getSession()
    if (data?.session?.user) return data.session.user

    const { data: signIn, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    if (!signIn?.user) throw new Error('Anonim oturum açılamadı. Supabase ayarlarında anonymous sign-ins açık mı?')
    return signIn.user
  })().catch((err) => {
    sessionPromise = null
    throw err
  })
  return sessionPromise
}
