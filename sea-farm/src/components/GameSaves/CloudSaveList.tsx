import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  deleteCloudSlot, listCloudSlots, loadCloudSlot, SaveConflict, writeCloudSlot,
  type CloudSlot, type SaveMode,
} from "@/services/cloudSaves"
import { saveOwner } from "@/services/saveSession"
import "./saves.css"

interface Props {
  mode: SaveMode
  snapshot: () => { id: string; name: string; payload: unknown }
  restore: (data: unknown, slot: CloudSlot) => void
}

// Only a successful load or write advances the base for the next overwrite.
// This survives closing the save panel. Switching accounts reloads the game.
const revisions = new Map<string, string>()

export function CloudSaveList({ mode, snapshot, restore }: Props) {
  const { t } = useTranslation("saves")
  const [slots, setSlots] = useState<CloudSlot[]>([])
  const [ready, setReady] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const locked = useRef(false)
  const owner = saveOwner()

  function report(error: unknown) {
    const code = (error as { code?: string } | null)?.code
    setMessage(error instanceof SaveConflict ? "conflict" :
      code === "PGRST205" || code === "42P01" ? "schema" : "unavailable")
  }

  useEffect(() => {
    if (!owner) return
    let current = true
    listCloudSlots(mode).then(rows => {
      if (current) { setSlots(rows); setReady(true) }
    }, error => { if (current) report(error) }).finally(() => { if (current) setInitialLoad(false) })
    return () => { current = false }
  }, [owner, mode])

  async function run(action: () => Promise<void>) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setMessage("")
    try { await action() }
    catch (error) { report(error) }
    finally { locked.current = false; setBusy(false) }
  }

  async function refresh() {
    const rows = await listCloudSlots(mode)
    for (const slot of slots) {
      if (!rows.some(row => row.slot_id === slot.slot_id)) revisions.delete(mode + "/" + slot.slot_id)
    }
    setSlots(rows)
    setReady(true)
  }

  async function save() {
    const { id, name, payload } = snapshot()
    const key = mode + "/" + id
    const listed = slots.find(slot => slot.slot_id === id)
    const known = revisions.get(key)
    if (listed && !known && !window.confirm(t("overwrite"))) return
    const expectedRevision = listed ? known ?? listed.revision : undefined
    const updated = await writeCloudSlot(mode, id, name, payload, expectedRevision)
    revisions.set(key, updated.revision)
    setSlots(rows => [updated, ...rows.filter(s => s.slot_id !== id)])
    setMessage("saved")
  }

  async function load(slot: CloudSlot) {
    const current = await loadCloudSlot(mode, slot.slot_id)
    try { restore(current.payload, current) }
    catch { setMessage("invalid"); return }
    revisions.set(mode + "/" + slot.slot_id, current.revision)
    setSlots(rows => rows.map(s => s.slot_id === slot.slot_id ? current : s))
    setMessage("loaded")
  }

  async function remove(slot: CloudSlot) {
    if (!window.confirm(t("deleteConfirm"))) return
    await deleteCloudSlot(mode, slot)
    revisions.delete(mode + "/" + slot.slot_id)
    setSlots(rows => rows.filter(s => s.slot_id !== slot.slot_id))
    setMessage("deleted")
  }

  return (
    <section className="sea-save-section" aria-label={t("cloud")}>
      <h3>{t("cloud")}</h3>
      {owner ? <>
        <div className="sea-save-actions">
          <button type="button" disabled={busy || !ready} onClick={() => run(save)}>{t("save")}</button>
          <button type="button" disabled={busy || initialLoad} onClick={() => run(refresh)}>{t("refresh")}</button>
        </div>
        {ready && slots.length === 0 && <p>{t("empty")}</p>}
        {slots.map(slot => <div key={slot.slot_id} className="sea-save-row">
          <span>{slot.name}</span>
          <button type="button" disabled={busy} onClick={() => run(() => load(slot))}>{t("load")}</button>
          <button type="button" disabled={busy} onClick={() => run(() => remove(slot))}>{t("remove")}</button>
        </div>)}
        <p role="status">{busy || initialLoad ? t("busy") : message && t(message)}</p>
      </> : <p>{t("signIn")}</p>}
    </section>
  )
}
