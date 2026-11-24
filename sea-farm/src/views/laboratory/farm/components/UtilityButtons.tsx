import { useControls } from "@/views/controls"
import type { ReactElement } from "react"
import styles from "../styles/UtilityButtons.module.scss"

interface UtilityButtonsProps {
  showGrid: boolean
  onToggleGrid: () => void
  onResetView: () => void
}

export const UtilityButtons = ({
  showGrid,
  onToggleGrid,
  onResetView,
}: UtilityButtonsProps): ReactElement => {
  const t = useControls()
  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={onToggleGrid}
        className={`${styles.button} ${styles.grid} ${!showGrid ? styles.inactive : ""}`}
      >
        {showGrid ? "🟢" : "⚫"} {t("grid")}
      </button>

      <button
        type="button"
        onClick={onResetView}
        className={`${styles.button} ${styles.reset}`}
      >
        🔄 {t("reset")}
      </button>
    </div>
  )
}
