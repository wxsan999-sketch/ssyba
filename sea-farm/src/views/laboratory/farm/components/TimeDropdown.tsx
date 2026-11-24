import { useTranslation } from "react-i18next"
import type { ReactElement } from "react"
import styles from "../styles/Dropdowns.module.scss"

type TimeOfDay = "day" | "afternoon" | "night"

interface TimeDropdownProps {
  value: TimeOfDay
  onChange: (time: TimeOfDay) => void
}

const TIME_OPTIONS: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: "day", label: "Day", emoji: "☀️" },
  { value: "afternoon", label: "Afternoon", emoji: "🌅" },
  { value: "night", label: "Night", emoji: "🌙" },
]

export const TimeDropdown = ({
  value,
  onChange,
}: TimeDropdownProps): ReactElement => {
  const { t } = useTranslation("laboratory")
  return (
    <div className={styles.dropdown}>
      <select
        value={value}
        aria-label={t("welcome.features.timeOfDay.title")}
        onChange={(e) => onChange(e.target.value as TimeOfDay)}
      >
        {TIME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.emoji} {t("time."+option.value)}
          </option>
        ))}
      </select>
      <div className={styles.arrow}>▼</div>
    </div>
  )
}
