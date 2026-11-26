import { Link } from "@tanstack/react-router"
import { ArrowRight, Github, Shell, Waves, Radio } from "lucide-react"
import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"

import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector"
import { musicPlayerActions } from "@/engine/musicPlayerStore"
import { leaderboardName } from "@/services/saveSession"

import "./main_menu.css"

export const MainMenu = (): ReactElement => {
  const { t } = useTranslation("menu")
  return (
    <main className="sea-menu">
      <img className="sea-menu__scene" src="./images/sea-farm-cover.jpg" alt="" />
      <LanguageSelector />
      {window.location.pathname.includes("/games/sea-farm/") && (
        <a className="sea-menu__portal" href="../../">← SSyba</a>
      )}
      <div className="sea-menu__panel">
        <h1><img src="./images/sea-farm-wordmark.svg" alt="Sea Farm" /></h1>
        <p className="sea-menu__player">{t("player", { name: leaderboardName() })}</p>
        <p className="sea-menu__intro">{t("subtitle")}</p>
        <nav className="sea-menu__modes" aria-label={t("title")}>
          <Link className="sea-menu__mode sea-menu__mode--garden" to="/crops_farm">
            <span className="sea-menu__symbol"><Shell aria-hidden="true" /></span>
            <span><strong>{t("cards.crops.title")}</strong><small>{t("cards.crops.description")}</small></span>
            <ArrowRight className="sea-menu__arrow" aria-hidden="true" />
          </Link>
          <Link className="sea-menu__mode" to="/farm_laboratory">
            <span className="sea-menu__symbol"><Waves aria-hidden="true" /></span>
            <span><strong>{t("cards.designer.title")}</strong><small>{t("cards.designer.description")}</small></span>
            <ArrowRight className="sea-menu__arrow" aria-hidden="true" />
          </Link>
        </nav>
        <button className="sea-menu__radio" type="button" onClick={musicPlayerActions.open}>
          <Radio size={18} aria-hidden="true" /> {t("prototype.openRadio")}
        </button>
        <Link to="/leaderboard" className="sea-menu__ranking-link">{t("title", { ns: "leaderboard" })}</Link>
      </div>
      <a className="sea-menu__source" href="https://github.com/wxsan999-sketch/ssyba" target="_blank" rel="noreferrer">
        <Github size={16} aria-hidden="true" /> {t("social.github")}
      </a>
    </main>
  )
}

export default MainMenu
