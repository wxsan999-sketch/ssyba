import { useControls } from "@/views/controls"
import type { ReactElement } from "react"
import type { EditorMode } from "../farm_config"
import { EDITOR_MODES } from "../farm_config"
import styles from "../styles/ModeButtons.module.scss"

interface ModeButtonsProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
}

export const ModeButtons = ({
  mode,
  onModeChange,
}: ModeButtonsProps): ReactElement => {
  const t = useControls()
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.button} ${styles.place} ${mode === EDITOR_MODES.PLACE ? styles.active : ""}`}
        onClick={() => onModeChange(EDITOR_MODES.PLACE)}
      >
        📍 {t("place")}
      </button>

      <button
        type="button"
        className={`${styles.button} ${styles.paint} ${mode === EDITOR_MODES.PAINT ? styles.active : ""}`}
        onClick={() => onModeChange(EDITOR_MODES.PAINT)}
      >
        🖌️ {t("paint")}
      </button>
    </div>
  )
}
