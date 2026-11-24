import { useTranslation } from "react-i18next"
import "./CropsWelcome.css"

interface CropsWelcomeProps {
  isOpen: boolean
  onClose: () => void
}

const sections = [
  { heading: "farmingTools", group: "tools", keys: ["hoe", "seeds", "wateringCan", "scythe"] },
  { heading: "gameMechanics", group: "mechanics", keys: ["growthStages", "harvest", "timeControl", "inventory", "hotbar", "camera"] },
]

export const CropsWelcome = ({ isOpen, onClose }: CropsWelcomeProps) => {
  const { t } = useTranslation("crops")
  if (!isOpen) return null
  return (
    <div className="sea-guide-backdrop" onClick={onClose} onKeyDown={event => {
      if (event.key === "Escape") onClose()
    }}>
      <section className="sea-guide" role="dialog" aria-modal="true" aria-labelledby="sea-guide-title"
        onClick={event => event.stopPropagation()}>
        <header>
          <h1 id="sea-guide-title">{t("welcome.title")}</h1>
          <p>{t("welcome.introduction")}</p>
        </header>
        <div className="sea-guide__body">
          {sections.map(({heading, group, keys}) => (
            <section key={group}>
              <h2>{t(`welcome.${heading}`)}</h2>
              <dl>{keys.map(key => (
                <div key={key}>
                  <dt>{t(`welcome.${group}.${key}.title`)}</dt>
                  <dd>{t(`welcome.${group}.${key}.description`)}</dd>
                </div>
              ))}</dl>
            </section>
          ))}
        </div>
        <footer><button type="button" autoFocus onClick={onClose}>{t("welcome.startFarming")}</button></footer>
      </section>
    </div>
  )
}
