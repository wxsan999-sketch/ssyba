import { useState } from "react"
import { useTranslation } from "react-i18next"
import { captureGarden, loadDeviceGarden, restoreGarden, saveDeviceGarden } from "@/services/gardenStorage"
import { CloudSaveList } from "./CloudSaveList"

export function GardenSaves() {
  const { t } = useTranslation("saves")
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  function deviceAction(save: boolean) {
    try {
      if (save) { saveDeviceGarden(); setMessage("saved") }
      else setMessage(loadDeviceGarden() ? "loaded" : "missing")
    } catch { setMessage("localError") }
  }

  return <div className="sea-garden-saves">
    <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)}>{t("manage")}</button>
    {open && <div className="sea-save-panel">
      <section className="sea-save-section" aria-label={t("device")}>
        <h3>{t("device")}</h3>
        <div className="sea-save-actions">
          <button type="button" onClick={() => deviceAction(true)}>{t("save")}</button>
          <button type="button" onClick={() => deviceAction(false)}>{t("load")}</button>
        </div>
        <p role="status">{message && t(message)}</p>
      </section>
      <CloudSaveList mode="garden" snapshot={() => ({ id: "garden", name: t("garden"), payload: captureGarden() })} restore={restoreGarden} />
      <button type="button" onClick={() => setOpen(false)}>{t("close")}</button>
    </div>}
  </div>
}
