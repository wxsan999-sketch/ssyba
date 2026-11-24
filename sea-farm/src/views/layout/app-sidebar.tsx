import { useControls } from "@/views/controls"
import "./app-sidebar.css"

import { Link, useRouterState } from "@tanstack/react-router"
import type { JSX } from "react"

interface AppSidebarProps {
  onClose: () => void
  isClosing?: boolean
}

export const AppSidebar = ({
  onClose,
  isClosing = false,
}: AppSidebarProps): JSX.Element => {
  const t = useControls()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <div className={`appSidebar ${isClosing ? "appSidebar--closing" : ""}`}>
      {/* Header with title and close button */}
      <div className="appSidebar__header">
        <h2 className="appSidebar__title">{t("menu")}</h2>
        <button
          onClick={onClose}
          className="appSidebar__closeButton"
          title={t("close")}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="appSidebar__content">
        <div className="appSidebar__navSection">
          <Link
            onClick={onClose}
            to="/farm_laboratory"
            className={`appSidebar__navLink ${currentPath === "/farm_laboratory" ? "appSidebar__navLink--active" : ""}`}
          >
            <span>🪸</span>
            <span>{t("menu:cards.designer.title")}</span>
          </Link>
          <Link
            onClick={onClose}
            to="/crops_farm"
            className={`appSidebar__navLink ${currentPath === "/crops_farm" ? "appSidebar__navLink--active" : ""}`}
          >
            <span>🐚</span>
            <span>{t("menu:cards.crops.title")}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
