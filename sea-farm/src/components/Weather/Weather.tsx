import type { CSSProperties, ReactElement } from "react"
import "@/engine/weather/scss/currents.scss"

export type WaterCondition = "sunny" | "rain" | "storm" | "snow"

export const waterConditions = [
  { value: "sunny", icon: "◉" },
  { value: "rain", icon: "🫧" },
  { value: "storm", icon: "≋" },
  { value: "snow", icon: "✧" },
] as const

export function Weather({ weather }: { weather: WaterCondition }): ReactElement | null {
  if (weather === "sunny") return null
  const count = weather === "storm" ? 40 : weather === "snow" ? 30 : 20
  return (
    <div aria-hidden="true" className={`water-current water-current--${weather}`}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{
          "--pos": `${(i * 37) % 100}%`,
          "--speed": `${5 + (i % 7)}s`,
          "--delay": `-${(i * 1.91) % 11}s`,
          "--size": `${3 + (i % 5)}px`,
        } as CSSProperties} />
      ))}
    </div>
  )
}
