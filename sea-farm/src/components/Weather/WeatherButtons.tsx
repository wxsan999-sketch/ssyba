import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"

import { waterConditions, type WaterCondition } from "./Weather"

interface WeatherButtonsProps {
  weather: WaterCondition
  onChange: (weather: WaterCondition) => void
}

export function WeatherButtons({weather, onChange}: WeatherButtonsProps): ReactElement {
  const { t } = useTranslation("laboratory")
  return (
    <div className="ml-8 flex gap-2 items-center" role="group" aria-label={t("welcome.features.weather.title")}>
      {waterConditions.map(({value, icon}) => <button key={value} type="button"
        aria-pressed={value === weather}
        className={`rounded px-2 py-1 text-xs ${value === weather ? "bg-teal-500" : "bg-cyan-800"}`}
        onClick={() => onChange(value)}>{icon} {t(`weather.${value}`)}</button>)}
    </div>
  )
}
