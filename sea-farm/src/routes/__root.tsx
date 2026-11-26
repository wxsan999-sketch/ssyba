import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useTranslation } from "react-i18next"

import Page from "@/views/layout/layout"
import { gameLoop } from "@/engine/GameLoop"
import { initializeSaveSession, saveClient } from "@/services/saveSession"

const authErrors: Partial<Record<string, string>> = {
  invalid_credentials: "auth.credentials",
  email_not_confirmed: "auth.checkEmail",
  weak_password: "auth.weakPassword",
  over_email_send_rate_limit: "auth.tooManyAttempts",
  over_request_rate_limit: "auth.tooManyAttempts",
}

function loginUrl() {
  const { hash, searchParams } = new URL(window.location.href)
  const login = new URL("../../login.html", window.location.href)
  login.searchParams.set("game", "sea-farm")
  const path = hash.split("?")[0]
  if (path === "#/crops_farm") login.searchParams.set("mode", "garden")
  if (path === "#/farm_laboratory" || hash.startsWith("#farm=")) {
    login.searchParams.set("mode", "reef")
    const farm = searchParams.get("farm") ?? (hash.startsWith("#farm=") ? hash.slice(6) : null)
    if (farm && farm.length <= 1800) login.searchParams.set("farm", farm)
  }
  return login.href
}

// The standalone development server and desktop bundle do not host the SSyba pages.
function StandaloneLogin() {
  const { t } = useTranslation("menu")
  const [busy, setBusy] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setCheckEmail(false)
    setError("")
    const username = String(form.get("username") ?? "").trim()
    if (registering && (username.length < 3 || username.length > 30)) {
      setError("auth.invalidName")
      return
    }
    setBusy(true)
    const credentials = { email: String(form.get("email")).trim(), password: String(form.get("password")) }
    try {
      const result = registering
        ? await saveClient.auth.signUp({ ...credentials, options: { data: { username } } })
        : await saveClient.auth.signInWithPassword(credentials)
      if (result.error) throw result.error
      if (result.data.session) {
        window.location.reload()
      } else if (registering) {
        formElement.reset()
        setRegistering(false)
        setCheckEmail(true)
      }
    } catch (cause) {
      const code = (cause as { code?: string } | null)?.code
      setError(authErrors[code ?? ""] ?? (registering ? "auth.registerFailed" : "auth.loginFailed"))
    } finally {
      setBusy(false)
    }
  }
  return <form className="sea-menu__login" onSubmit={submit} aria-busy={busy}>
    <h2>{t(registering ? "auth.register" : "auth.login")}</h2>
    <p>{t("auth.publicStats")}</p>
    {registering && <label>{t("auth.username")}<input name="username" required minLength={3} maxLength={30}
      autoComplete="nickname" /></label>}
    <label>{t("auth.email")}<input name="email" type="email" required autoComplete="username" /></label>
    <label>{t("auth.password")}<input name="password" type="password" required minLength={registering ? 6 : undefined}
      autoComplete={registering ? "new-password" : "current-password"} /></label>
    {error && <p role="alert">{t(error)}</p>}
    {checkEmail && <p role="status">{t("auth.checkEmail")}</p>}
    <button className="sea-menu__action" disabled={busy} type="submit">{t(registering ? "auth.register" : "auth.login")}</button>
    <button className="sea-menu__switch" type="button" disabled={busy}
      onClick={() => { setRegistering(!registering); setError(""); setCheckEmail(false) }}>
      {t(registering ? "auth.login" : "auth.register")}
    </button>
    <a href="#/leaderboard">{t("title", { ns: "leaderboard" })}</a>
  </form>
}

function AuthenticatedGame() {
  const { t } = useTranslation("menu")
  const [status, setStatus] = useState<"checking" | "ready" | "failed" | "login">("checking")
  useEffect(() => {
    let active = true
    initializeSaveSession().then(verified => {
      if (!active) return
      if (!verified) {
        if (window.location.pathname.includes("/games/sea-farm/")) window.location.replace(loginUrl())
        else setStatus("login")
        return
      }
      gameLoop.start()
      setStatus("ready")
    }).catch(() => { if (active) setStatus("failed") })
    return () => { active = false; gameLoop.stop() }
  }, [])
  if (status === "ready") return <Page />
  return <main className="sea-menu">
    <img className="sea-menu__scene" src="./images/sea-farm-cover.jpg" alt="" />
    <div className="sea-menu__panel">
      <h1><img src="./images/sea-farm-wordmark.svg" alt="Sea Farm" /></h1>
      {status === "login" ? <StandaloneLogin /> :
        <p className="sea-menu__intro" role="status">{t(status === "failed" ? "auth.failed" : "auth.checking")}</p>}
      {status === "failed" && <button className="sea-menu__action" onClick={() => window.location.reload()}>{t("auth.retry")}</button>}
    </div>
  </main>
}

export const RootLayout = createRootRoute({
  component: function GameEntry() {
    const path = useLocation({ select: location => location.pathname })
    return path === "/leaderboard" ? <Outlet /> : <AuthenticatedGame />
  },
})
