import React from "react"
import { useTranslation } from "react-i18next"

interface TimeOfDayButtonsProps {
  timeOfDay: "day" | "afternoon" | "night"
  onChange: (time: "day" | "afternoon" | "night") => void
}

export const TimeOfDayButtons = ({
  timeOfDay,
  onChange,
}: TimeOfDayButtonsProps): React.ReactElement => {
  const { t } = useTranslation("laboratory")
  return (
  <div className="ml-8 flex gap-2 items-center">
    <span className="text-xs opacity-70">{t("welcome.features.timeOfDay.title")}</span>
    <button
      onClick={() => onChange("day")}
      type="button"
      className={`rounded px-2 py-1 text-xs ${
        timeOfDay === "day" ? "bg-yellow-500" : "bg-yellow-600/50"
      }`}
    >
      ☀️ {t("time.day")}
    </button>
    <button
      onClick={() => onChange("afternoon")}
      type="button"
      className={`rounded px-2 py-1 text-xs ${
        timeOfDay === "afternoon" ? "bg-orange-500" : "bg-orange-600/50"
      }`}
    >
      🌅 {t("time.afternoon")}
    </button>
    <button
      onClick={() => onChange("night")}
      type="button"
      className={`rounded px-2 py-1 text-xs ${
        timeOfDay === "night" ? "bg-blue-600" : "bg-blue-700/50"
      }`}
    >
      🌙 {t("time.night")}
    </button>
  </div>
  )
}
