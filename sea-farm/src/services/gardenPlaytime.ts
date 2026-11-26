import { worldStore } from "@/engine/store"
import { deviceKey } from "./saveSession"

let playerKey = ""
let recordedMs = 0
let runningSince: number | null = null

function selectPlayer() {
  const key = deviceKey("played-seconds")
  if (key === playerKey) return
  playerKey = key
  recordedMs = 0
  runningSince = null
  try {
    const saved = Number(localStorage.getItem(key))
    if (Number.isSafeInteger(saved) && saved >= 0) recordedMs = saved * 1000
  } catch {
    // A player with device storage disabled can still play and save to the cloud.
  }
}

function elapsedMs() {
  return recordedMs + (runningSince === null ? 0 : performance.now() - runningSince)
}

export function getPlayedSeconds(): number {
  selectPlayer()
  return Math.floor(elapsedMs() / 1000)
}

/** An older checkpoint can restore the garden, but cannot take away time already played. */
export function rememberPlayedSeconds(seconds: number) {
  selectPlayer()
  if (Number.isSafeInteger(seconds) && seconds >= 0) {
    recordedMs += Math.max(0, seconds * 1000 - elapsedMs())
  }
}

export function persistPlayedSeconds() {
  const seconds = getPlayedSeconds()
  try {
    const prior = Number(localStorage.getItem(playerKey))
    if (!Number.isSafeInteger(prior) || seconds > prior) {
      localStorage.setItem(playerKey, String(seconds))
    }
  } catch {
    // The device and cloud garden snapshots also carry the same counter.
  }
}

export function trackGardenPlaytime() {
  selectPlayer()
  function stop() {
    if (runningSince !== null) {
      recordedMs += performance.now() - runningSince
      runningSince = null
    }
  }
  function sync() {
    if (document.visibilityState === "visible" && !worldStore.getState().isPaused) {
      runningSince ??= performance.now()
    } else {
      stop()
    }
  }
  sync()
  const unsubscribe = worldStore.subscribe((state, prev) => {
    if (state.isPaused !== prev.isPaused) sync()
  })
  document.addEventListener("visibilitychange", sync)
  window.addEventListener("pagehide", stop)
  window.addEventListener("pageshow", sync)
  return () => {
    stop()
    unsubscribe()
    document.removeEventListener("visibilitychange", sync)
    window.removeEventListener("pagehide", stop)
    window.removeEventListener("pageshow", sync)
  }
}
