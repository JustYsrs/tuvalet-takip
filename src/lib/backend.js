import { demoBackend } from './demoBackend'
import { ensureSession, isSupabaseConfigured, supabase } from './supabase'

const COLUMNS = 'slot_index, owner_name, owner_id, claimed_at'

const supabaseBackend = {
  ensureSession,

  async list() {
    const { data, error } = await supabase.from('slots').select(COLUMNS)
    if (error) throw error
    return data
  },

  subscribe({ onUpsert, onDelete, onResync, onStatus }) {
    const channel = supabase
      .channel('slots-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots' }, (payload) => {
        if (payload.eventType === 'DELETE') onDelete(payload.old.slot_index)
        else onUpsert(payload.new)
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          onStatus('live')
          // Bağlantı koptuysa aradaki değişiklikleri kaçırmamak için yeniden senkronize ol.
          onResync()
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
          onStatus('offline')
        }
      })
    return () => supabase.removeChannel(channel)
  },

  async claim(index, ownerName) {
    const { data, error } = await supabase
      .from('slots')
      .insert({ slot_index: index, owner_name: ownerName })
      .select(COLUMNS)
      .single()
    if (error) {
      if (error.code === '23505') return { ok: false, reason: 'taken' }
      return { ok: false, reason: 'error', message: error.message }
    }
    return { ok: true, row: data }
  },

  async release(index) {
    const { data, error } = await supabase.from('slots').delete().eq('slot_index', index).select('slot_index')
    if (error) return { ok: false, reason: 'error', message: error.message }
    // RLS sahibi olmayanın silmesini sessizce engeller (0 satır döner).
    if (data.length === 0) return { ok: false, reason: 'forbidden' }
    return { ok: true }
  },
}

export const isDemo = !isSupabaseConfigured || import.meta.env.VITE_DEMO === 'true'

export const backend = isDemo ? demoBackend : supabaseBackend
