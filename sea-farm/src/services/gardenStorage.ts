import { createStore } from "zustand/vanilla"

import { dropsStore } from "@/engine/dropsStore"
import { initialEconomy, isEconomy } from "@/engine/economyData"
import { hotbarActions, hotbarStore } from "@/engine/hotbarStore"
import { buildItemsMap, inventoryStore } from "@/engine/inventoryStore"
import { worldStore } from "@/engine/store"
import { toolsStore } from "@/engine/toolsStore"
import { useCropsGroundTilesStore } from "@/views/laboratory/crops/stores/cropsGroundTilesStore"
import Map1Data from "@/engine/data/maps/map_1.json"
import { loadMapDataSync, type MapData } from "@/utils/loadMapData"
import { deviceKey } from "./saveSession"
import { getPlayedSeconds, persistPlayedSeconds, rememberPlayedSeconds, trackGardenPlaytime } from "./gardenPlaytime"

export function captureGarden() {
  const { gameTime, isPaused, timeScale, entities, tilledSoil } = worldStore.getState()
  const { slots, economy } = inventoryStore.getState()
  const { activeHotbar, activeSlotIndex, mainHotbar, customHotbar1, customHotbar2 } = hotbarStore.getState()
  return {
    version: 2 as const,
    playedSeconds: getPlayedSeconds(),
    gameTime, isPaused, timeScale, entities,
    tilledSoil: [...tilledSoil],
    groundTiles: [...useCropsGroundTilesStore.getState().groundTiles],
    inventory: slots,
    economy,
    toolOrder: toolsStore.getState().toolHotbarOrder,
    hotbar: { activeHotbar, activeSlotIndex, mainHotbar, customHotbar1, customHotbar2 },
  }
}

type CurrentGarden = ReturnType<typeof captureGarden>
type LegacyGarden = Omit<CurrentGarden, "version" | "economy" | "playedSeconds"> & { version: 1 }
type Garden = (Omit<CurrentGarden, "playedSeconds"> & { playedSeconds?: number }) | LegacyGarden

function isGarden(value: unknown): value is Garden {
  const g = value as Partial<Garden> | null
  if (!g || (g.version !== 1 && g.version !== 2) || !g.gameTime || !g.hotbar) return false
  if (g.version === 2 && (
    !isEconomy(g.economy) || (g.playedSeconds !== undefined &&
      (!Number.isSafeInteger(g.playedSeconds) || g.playedSeconds < 0))
  )) return false
  const h = g.hotbar
  return Object.values(g.gameTime).every(Number.isFinite)
    && ["hour", "minute", "day", "totalMinutes"].every(key => key in g.gameTime!)
    && typeof g.isPaused === "boolean" && Number.isFinite(g.timeScale) && g.timeScale! > 0
    && Array.isArray(g.entities) && g.entities.every(e => e?.sprite && typeof e.id === "string")
    && Array.isArray(g.tilledSoil) && g.tilledSoil.every(e => Array.isArray(e) && typeof e[0] === "string" && e[1])
    && Array.isArray(g.groundTiles) && g.groundTiles.every(e => Array.isArray(e) && Array.isArray(e[1]?.layers))
    && Array.isArray(g.inventory) && g.inventory.length === inventoryStore.getInitialState().slots.length
    && g.inventory.every(s => s === null || (s && typeof s.id === "string" && Number.isSafeInteger(s.quantity) && s.quantity > 0))
    && Array.isArray(g.toolOrder) && g.toolOrder.every(t => toolsStore.getState().availableTools.includes(t))
    && ["main", "custom1", "custom2"].includes(h.activeHotbar) && Number.isInteger(h.activeSlotIndex)
    && h.activeSlotIndex >= 0 && h.activeSlotIndex < 10
    && [h.mainHotbar, h.customHotbar1, h.customHotbar2].every(slots =>
      Array.isArray(slots) && slots.length === 10 && slots.every(s => s && (s.itemId === null || typeof s.itemId === "string")))
}

export function restoreGarden(payload: unknown) {
  if (!isGarden(payload)) throw new Error("Invalid Sea Garden save")
  const { gameTime, isPaused, timeScale, entities, tilledSoil, groundTiles, inventory, toolOrder, hotbar } = payload
  if (payload.version === 2 && payload.playedSeconds !== undefined) rememberPlayedSeconds(payload.playedSeconds)
  const bars = { main: hotbar.mainHotbar, custom1: hotbar.customHotbar1, custom2: hotbar.customHotbar2 }
  const selectedId = bars[hotbar.activeHotbar][hotbar.activeSlotIndex]?.itemId
  const activeTool = toolsStore.getState().availableTools.find(tool => tool === selectedId) ?? null
  worldStore.setState({ gameTime, isPaused, timeScale, entities, tilledSoil: new Map(tilledSoil), activeTool })
  inventoryStore.setState({
    slots: inventory, itemsMap: buildItemsMap(inventory), isInventoryOpen: false,
    economy: payload.version === 1 ? initialEconomy() : payload.economy,
  })
  toolsStore.setState({ toolHotbarOrder: toolOrder })
  hotbarStore.setState({ ...hotbar, mouseDrag: null, decorationMenuOpen: false, selectedDecorationMode: null })
  useCropsGroundTilesStore.getState().setGroundTiles(new Map(groundTiles))
  dropsStore.setState({ items: [] })
}

export function saveDeviceGarden() {
  localStorage.setItem(deviceKey("garden"), JSON.stringify(captureGarden()))
  persistPlayedSeconds()
}

export function loadDeviceGarden() {
  const raw = localStorage.getItem(deviceKey("garden"))
  if (!raw) return false
  restoreGarden(JSON.parse(raw))
  return true
}

// Keep the automatic resume point separate from the player's deliberate Save / Load slot.
let lastResume: string | null = null
export const gardenResumeStatus = createStore<"automatic" | "anotherTab" | "localError">(() => "automatic")

function resumeGarden() {
  try {
    lastResume = localStorage.getItem(deviceKey("garden-resume"))
    if (lastResume !== null) {
      restoreGarden(JSON.parse(lastResume))
      return
    }
  } catch {
    // An older manual checkpoint may still be usable.
  }
  try {
    if (loadDeviceGarden()) return
  } catch {
    // A corrupt local snapshot must not prevent starting or loading a cloud save.
  }
  const terrain = loadMapDataSync(Map1Data as unknown as MapData)
  useCropsGroundTilesStore.getState().setGroundTiles(terrain)
  const toolOrder = toolsStore.getState().toolHotbarOrder
  hotbarActions.initializeMainHotbar(toolOrder)
  const starter = inventoryStore.getInitialState().slots[0]
  if (starter) hotbarActions.transferFromInventory(0, "main", 5, starter.id)
  hotbarActions.selectSlot(toolOrder.indexOf("hoe"))
}

let started = false
export function initializeGarden() {
  if (!started) {
    started = true
    resumeGarden()
  }

  const key = deviceKey("garden-resume")
  const stopClock = trackGardenPlaytime()
  function autosave() {
    persistPlayedSeconds()
    try {
      // A previously open tab must not overwrite another tab's newer progress on exit.
      if (localStorage.getItem(key) !== lastResume) {
        gardenResumeStatus.setState("anotherTab")
        return
      }
      const snapshot = JSON.stringify(captureGarden())
      if (lastResume !== snapshot) {
        localStorage.setItem(key, snapshot)
        lastResume = snapshot
      }
      gardenResumeStatus.setState("automatic")
    } catch {
      gardenResumeStatus.setState("localError")
    }
  }

  let active = true
  let pending = false
  const unsubscribe = inventoryStore.subscribe((state, prev) => {
    if (pending || (state.slots === prev.slots && state.economy === prev.economy)) return
    pending = true
    // Harvesting and planting update the world and inventory within the same input event.
    queueMicrotask(() => {
      pending = false
      if (active) autosave()
    })
  })
  const saveWhenHidden = () => {
    if (document.visibilityState === "hidden") autosave()
  }
  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible") autosave()
  }, 15_000)
  window.addEventListener("pagehide", autosave)
  document.addEventListener("visibilitychange", saveWhenHidden)
  return () => {
    active = false
    unsubscribe()
    window.clearInterval(timer)
    window.removeEventListener("pagehide", autosave)
    document.removeEventListener("visibilitychange", saveWhenHidden)
    stopClock()
    autosave()
  }
}
