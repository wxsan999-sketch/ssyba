import { inventoryStore } from "@/engine/inventoryStore"
import { getPlayedSeconds, rememberPlayedSeconds } from "./gardenPlaytime"
import { deviceKey, saveClient, saveOwner } from "./saveSession"

export type ScoreOrder = "balance" | "sales" | "time"
export interface ScoreRow {
  place: number
  player_name: string
  best_balance: number
  total_sales: number
  played_seconds: number
  is_me: boolean
}

let best = 0
let published = ""
let sending: Promise<void> | undefined

function noteBalance(balance: number) {
  if (balance <= best) return
  best = balance
  try { localStorage.setItem(deviceKey("best-balance"), String(best)) } catch { /* The current session still tracks the peak. */ }
}

export async function syncScore() {
  const owner = saveOwner()
  if (!owner) return
  // An earlier request must finish before sending a later wallet balance.
  if (sending) await sending
  if (owner !== saveOwner()) return
  const { balance, totalSales } = inventoryStore.getState().economy
  noteBalance(balance)
  const metrics = { p_balance: balance, p_best: best, p_sales: totalSales, p_seconds: getPlayedSeconds() }
  const signature = JSON.stringify(metrics)
  if (signature === published || sending) return
  sending = (async () => {
    const { data, error } = await saveClient.rpc("report_sea_farm_score", metrics)
    if (error) throw error
    if (owner !== saveOwner()) return
    published = signature
    if (Number.isSafeInteger(data) && data >= 0) rememberPlayedSeconds(data)
  })()
  try { await sending } finally { sending = undefined }
}

export function trackScores() {
  if (!saveOwner()) return
  try {
    const saved = Number(localStorage.getItem(deviceKey("best-balance")))
    if (Number.isSafeInteger(saved)) best = Math.max(best, saved)
  } catch { /* Storage may be unavailable in private browsing. */ }
  noteBalance(inventoryStore.getState().economy.balance)
  const send = () => { void syncScore().catch(() => { /* Retry on the next trade, connection or interval. */ }) }
  let timer = window.setTimeout(send, 700)
  const stop = inventoryStore.subscribe((state, previous) => {
    if (state.economy === previous.economy) return
    noteBalance(state.economy.balance)
    window.clearTimeout(timer)
    timer = window.setTimeout(send, 700)
  })
  const interval = window.setInterval(() => { if (!document.hidden) send() }, 45_000)
  const onVisibility = () => { if (document.hidden) send() }
  document.addEventListener("visibilitychange", onVisibility)
  window.addEventListener("online", send)
  return () => {
    stop()
    window.clearTimeout(timer)
    window.clearInterval(interval)
    document.removeEventListener("visibilitychange", onVisibility)
    window.removeEventListener("online", send)
    send()
  }
}

export async function getLeaderboard(order: ScoreOrder): Promise<ScoreRow[]> {
  const { data, error } = await saveClient.rpc("sea_farm_leaderboard", { p_order: order })
  if (error) throw error
  return data ?? []
}
