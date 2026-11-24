import { dropsStore } from "@/engine/dropsStore"
import { hotbarActions, hotbarStore } from "@/engine/hotbarStore"
import { buildItemsMap, inventoryStore } from "@/engine/inventoryStore"
import { worldStore } from "@/engine/store"
import { toolsStore } from "@/engine/toolsStore"
import { useCropsGroundTilesStore } from "@/views/laboratory/crops/stores/cropsGroundTilesStore"
import Map1Data from "@/engine/data/maps/map_1.json"
import { loadMapDataSync, type MapData } from "@/utils/loadMapData"
import { deviceKey } from "./saveSession"

export function captureGarden() {
  const { gameTime, isPaused, timeScale, entities, tilledSoil } = worldStore.getState()
  const { activeHotbar, activeSlotIndex, mainHotbar, customHotbar1, customHotbar2 } = hotbarStore.getState()
  return {
    version: 1,
    gameTime, isPaused, timeScale, entities,
    tilledSoil: [...tilledSoil],
    groundTiles: [...useCropsGroundTilesStore.getState().groundTiles],
    inventory: inventoryStore.getState().slots,
    toolOrder: toolsStore.getState().toolHotbarOrder,
    hotbar: { activeHotbar, activeSlotIndex, mainHotbar, customHotbar1, customHotbar2 },
  }
}

type Garden = ReturnType<typeof captureGarden>

function isGarden(value: unknown): value is Garden {
  const g = value as Partial<Garden> | null
  if (!g || g.version !== 1 || !g.gameTime || !g.hotbar) return false
  const h = g.hotbar
  return Object.values(g.gameTime).every(Number.isFinite)
    && ["hour", "minute", "day", "totalMinutes"].every(key => key in g.gameTime!)
    && typeof g.isPaused === "boolean" && Number.isFinite(g.timeScale) && g.timeScale! > 0
    && Array.isArray(g.entities) && g.entities.every(e => e?.sprite && typeof e.id === "string")
    && Array.isArray(g.tilledSoil) && g.tilledSoil.every(e => Array.isArray(e) && typeof e[0] === "string" && e[1])
    && Array.isArray(g.groundTiles) && g.groundTiles.every(e => Array.isArray(e) && Array.isArray(e[1]?.layers))
    && Array.isArray(g.inventory) && g.inventory.every(s => s === null || (s && typeof s.id === "string" && Number.isFinite(s.quantity)))
    && Array.isArray(g.toolOrder) && g.toolOrder.every(t => toolsStore.getState().availableTools.includes(t))
    && ["main", "custom1", "custom2"].includes(h.activeHotbar) && Number.isInteger(h.activeSlotIndex)
    && [h.mainHotbar, h.customHotbar1, h.customHotbar2].every(slots =>
      Array.isArray(slots) && slots.length === 10 && slots.every(s => s && (s.itemId === null || typeof s.itemId === "string")))
}

export function restoreGarden(payload: unknown) {
  if (!isGarden(payload)) throw new Error("Invalid Sea Garden save")
  const { gameTime, isPaused, timeScale, entities, tilledSoil, groundTiles, inventory, toolOrder, hotbar } = payload
  const bars = { main: hotbar.mainHotbar, custom1: hotbar.customHotbar1, custom2: hotbar.customHotbar2 }
  const selectedId = bars[hotbar.activeHotbar][hotbar.activeSlotIndex]?.itemId
  const activeTool = toolsStore.getState().availableTools.find(tool => tool === selectedId) ?? null
  worldStore.setState({ gameTime, isPaused, timeScale, entities, tilledSoil: new Map(tilledSoil), activeTool })
  inventoryStore.setState({ slots: inventory, itemsMap: buildItemsMap(inventory), isInventoryOpen: false })
  toolsStore.setState({ toolHotbarOrder: toolOrder })
  hotbarStore.setState({ ...hotbar, mouseDrag: null, decorationMenuOpen: false, selectedDecorationMode: null })
  useCropsGroundTilesStore.getState().setGroundTiles(new Map(groundTiles))
  dropsStore.setState({ items: [] })
}

export function saveDeviceGarden() {
  localStorage.setItem(deviceKey("garden"), JSON.stringify(captureGarden()))
}

export function loadDeviceGarden() {
  const raw = localStorage.getItem(deviceKey("garden"))
  if (!raw) return false
  restoreGarden(JSON.parse(raw))
  return true
}

let started = false
export function initializeGarden() {
  if (started) return
  started = true
  try {
    if (loadDeviceGarden()) return
  } catch {
    // A corrupt local snapshot must not prevent starting or loading a cloud save.
  }
  const terrain = loadMapDataSync(Map1Data as unknown as MapData)
  useCropsGroundTilesStore.getState().setGroundTiles(terrain)
  hotbarActions.initializeMainHotbar(toolsStore.getState().toolHotbarOrder)
}
