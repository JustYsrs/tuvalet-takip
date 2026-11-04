import { useCallback, useEffect, useState } from 'react'
import { backend } from '../lib/backend'
import { isClaimed } from '../lib/slots'

export function useSlots() {
  const [userId, setUserId] = useState(null)
  const [slots, setSlots] = useState(() => new Map())
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)

  const removeLocal = useCallback((index) => {
    setSlots((prev) => {
      if (!prev.has(index)) return prev
      const next = new Map(prev)
      next.delete(index)
      return next
    })
  }, [])

  const upsertLocal = useCallback(
    (row) => {
      if (!isClaimed(row)) {
        if (row?.slot_index != null) removeLocal(row.slot_index)
        return
      }
      setSlots((prev) => new Map(prev).set(row.slot_index, row))
    },
    [removeLocal],
  )

  const load = useCallback(async () => {
    const rows = (await backend.list()) ?? []
    setSlots(new Map(rows.filter(isClaimed).map((row) => [row.slot_index, row])))
  }, [])

  useEffect(() => {
    let active = true
    let unsubscribe = null

    backend
      .ensureSession()
      .then(async (user) => {
        if (!active) return
        setUserId(user.id)
        await load()
        if (!active) return
        setReady(true)

        unsubscribe = backend.subscribe({
          onUpsert: (row) => active && upsertLocal(row),
          onDelete: (index) => active && removeLocal(index),
          onResync: () => active && load().catch(() => {}),
          onStatus: (s) => active && setStatus(s),
        })
      })
      .catch((err) => {
        if (!active) return
        setError(err)
        setStatus('error')
      })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [load, upsertLocal, removeLocal])

  const claim = useCallback(
    async (index, ownerName) => {
      const result = await backend.claim(index, ownerName)
      if (result.ok && result.row) upsertLocal(result.row)
      else if (result.reason === 'taken') await load().catch(() => {})
      return result
    },
    [load, upsertLocal],
  )

  const release = useCallback(
    async (index) => {
      const result = await backend.release(index)
      if (result.ok) removeLocal(index)
      else if (result.reason === 'forbidden') await load().catch(() => {})
      return result
    },
    [load, removeLocal],
  )

  return { userId, ready, slots, status, error, claim, release }
}
