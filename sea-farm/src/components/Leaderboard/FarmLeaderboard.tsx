import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Trophy, X } from "lucide-react"
import { getLeaderboard, syncScore, trackScores, type ScoreOrder, type ScoreRow } from "@/services/leaderboard"
import { leaderboardName } from "@/services/saveSession"
import "./leaderboard.css"

const orders: ScoreOrder[] = ["balance", "sales", "time"]

function RankingResults({ inGame = false }: { inGame?: boolean }) {
  const { t, i18n } = useTranslation("leaderboard")
  const [order, setOrder] = useState<ScoreOrder>("balance")
  const [refresh, setRefresh] = useState(0)
  const [rows, setRows] = useState<ScoreRow[]>([])
  const [status, setStatus] = useState("loading")
  const [syncFailed, setSyncFailed] = useState(false)
  useEffect(() => {
    let current = true
    setStatus("loading")
    setSyncFailed(false)
    async function load() {
      if (inGame) {
        try { await syncScore() } catch { if (current) setSyncFailed(true) }
      }
      try {
        const data = await getLeaderboard(order)
        if (current) { setRows(data); setStatus(data.length ? "" : "empty") }
      } catch (e) {
        const code = (e as { code?: string } | null)?.code
        if (current) setStatus(code === "PGRST202" || code === "42883" ? "setup" : "offline")
      }
    }
    void load()
    return () => { current = false }
  }, [inGame, order, refresh])

  const number = new Intl.NumberFormat(i18n.language)
  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return [
      hours > 0 && `${number.format(hours)} ${t("hours")}`,
      (hours > 0 || minutes > 0) && `${number.format(minutes)} ${t("minutes")}`,
      `${number.format(seconds % 60)} ${t("seconds")}`,
    ].filter(Boolean).join(" ")
  }
  const columns: ScoreOrder[] = order === "sales" ? ["sales"] : order === "time" ? ["time", "balance"] : ["balance", "time"]

  return <>
      <p>{t("note")}</p>
      <div className="farm-ranking__order" role="group" aria-label={t("sort")}>
        {orders.map(key => <button type="button" key={key} aria-pressed={key === order} onClick={() => setOrder(key)}>{t(key)}</button>)}
      </div>
      {status ? <p className="farm-ranking__status" role="status">{t(status)}</p> :
        <div className="farm-ranking__results"><table>
          <thead><tr><th>{t("rank")}</th><th>{t("farmer")}</th>{columns.map(column =>
            <th key={column} aria-sort={column === order ? (order === "time" ? "ascending" : "descending") : undefined}>{t(column)}</th>
          )}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={index} data-mine={row.is_me || undefined}>
            <td>{number.format(row.place)}</td>
            <td>{row.player_name}{row.is_me && <small> · {t("you")}</small>}</td>
            {columns.map(column => <td key={column}>{column === "time" ? formatTime(row.played_seconds)
              : number.format(column === "balance" ? row.best_balance : row.total_sales) + " " + t("unit")}</td>)}
          </tr>)}</tbody>
        </table></div>}
      <footer>
        <span>{syncFailed && status !== "setup" ? t("sync") : ""}</span>
        <button type="button" disabled={status === "loading"} onClick={() => setRefresh(n => n + 1)}>{t("refresh")}</button>
      </footer>
  </>
}

export function FarmLeaderboard() {
  const { t } = useTranslation("leaderboard")
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(trackScores, [])
  return <>
    <button type="button" className="reef-market__launcher" title={t("title")}
      aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); setOpen(true) }}>
      <Trophy aria-hidden="true" size={17} /><span>{t("short")}</span>
    </button>
    <dialog ref={dialog} className="farm-ranking" aria-labelledby="farm-ranking-title" onClose={() => setOpen(false)}>
      <header>
        <h2 id="farm-ranking-title"><Trophy aria-hidden="true" size={21} />{t("title")}</h2>
        <button type="button" aria-label={t("close")} onClick={() => dialog.current?.close()}><X size={19} /></button>
      </header>
      {open && <>
        <p>{t("player", { ns: "menu", name: leaderboardName() })}</p>
        <RankingResults inGame />
      </>}
    </dialog>
  </>
}

export function PublicLeaderboard() {
  const { t } = useTranslation("leaderboard")
  return <main className="sea-menu sea-menu--ranking">
    <img className="sea-menu__scene" src="./images/sea-farm-cover.jpg" alt="" />
    <section className="farm-ranking" aria-labelledby="public-ranking-title">
      <header><h1 id="public-ranking-title"><Trophy aria-hidden="true" size={23} />{t("title")}</h1></header>
      <RankingResults />
      <a className="sea-menu__action" href="#/crops_farm">{t("cards.crops.title", { ns: "menu" })}</a>
    </section>
  </main>
}
