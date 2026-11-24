import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"

import { waterConditions, type WaterCondition } from "@/components/Weather/Weather"
import styles from "../styles/Dropdowns.module.scss"

interface WeatherDropdownProps {
  value: WaterCondition
  onChange: (condition: WaterCondition) => void
}

export function WeatherDropdown({ value, onChange }: WeatherDropdownProps): ReactElement {
  const { t } = useTranslation("laboratory")
  return (
    <div className={styles.dropdown}>
      <select value={value} aria-label={t("welcome.features.weather.title")}
        onChange={event => onChange(event.target.value as WaterCondition)}>
        {waterConditions.map(({value, icon}) => (
          <option key={value} value={value}>{icon} {t(`weather.${value}`)}</option>
        ))}
      </select>
      <div className={styles.arrow}>▼</div>
    </div>
  )
}
