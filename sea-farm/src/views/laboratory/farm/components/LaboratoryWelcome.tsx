import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import "./LaboratoryWelcome.css"

interface LaboratoryWelcomeProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = ["cameraMovement", "idleMode", "paintMode", "toggleGrid", "toggleWater", "hideUI"] as const
const features = ["resetGrid", "timeOfDay", "weather", "waterVisibility", "gridVisibility", "gridSize", "saveLoad"] as const

export function LaboratoryWelcome({ isOpen, onClose }: LaboratoryWelcomeProps) {
  const { t } = useTranslation("laboratory")
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) dialog.current?.showModal()
    else dialog.current?.close()
  }, [isOpen])

  return (
    <dialog className="reef-guide" ref={dialog} aria-labelledby="reef-guide-title"
      onCancel={onClose} onClick={(event) => { if (event.target === dialog.current) onClose() }}>
      <div className="reef-guide__sheet">
        <header className="reef-guide__header">
          <img src="./favicon.png" alt="" width="44" height="44" />
          <h1 id="reef-guide-title">{t("welcome.title")}</h1>
        </header>
        <section className="reef-guide__body">
          <p dangerouslySetInnerHTML={{ __html: t("welcome.introduction") }} />
          <h2>{t("welcome.keyboardShortcuts")}</h2>
          <dl>{shortcuts.map(key => <div key={key}>
            <dt>{t(`welcome.shortcuts.${key}.title`)}<small>{t(`welcome.shortcuts.${key}.description`)}</small></dt>
            <dd><kbd>{t(`welcome.shortcuts.${key}.key`)}</kbd></dd>
          </div>)}</dl>
          <h2>{t("welcome.toolbarFeatures")}</h2>
          <dl>{features.map(key => <div key={key}>
            <dt>{t(`welcome.features.${key}.title`)}<small>{t(`welcome.features.${key}.description`)}</small></dt>
          </div>)}</dl>
        </section>
        <footer><button type="button" onClick={onClose}>{t("welcome.getStarted")}</button></footer>
      </div>
    </dialog>
  )
}
