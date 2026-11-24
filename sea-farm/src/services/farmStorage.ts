/**
 * Farm Storage Service
 *
 * Handles saving/loading multiple farms to localStorage
 * and sharing via URL with Base64 encoding.
 */

import type { GroundTile } from "@/engine/autotiling/groundAutotiling"
import type { Entity } from "@/engine/interfaces/entity"
import { deviceKey, saveOwner } from "./saveSession"

// ============ TYPES ============

export interface FarmSaveData {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  version: number
  data: {
    groundTiles: [string, GroundTile][] // Map serialized as entries
    entities: Entity[]
    width: number
    height: number
  }
}

export function isFarm(data: unknown): data is FarmSaveData {
  const farm = data as Partial<FarmSaveData> | null
  return !!farm && farm.version === 1 && typeof farm.id === "string" && typeof farm.name === "string"
    && !!farm.data && Number.isInteger(farm.data.width) && farm.data.width > 0
    && Number.isInteger(farm.data.height) && farm.data.height > 0
    && Array.isArray(farm.data.entities) && Array.isArray(farm.data.groundTiles)
    && farm.data.entities.every(e => e && e.sprite && Number.isFinite(e.x) && Number.isFinite(e.y))
    && farm.data.groundTiles.every(e => Array.isArray(e) && typeof e[0] === "string" && Array.isArray(e[1]?.layers))
}

interface FarmListItem {
  id: string
  name: string
  updatedAt: number
}

// ============ CONSTANTS ============

const CURRENT_VERSION = 1

// ============ LOCAL STORAGE ============

/**
 * Save a farm to localStorage
 */
export function saveFarm(
  id: string,
  name: string,
  groundTiles: Map<string, GroundTile>,
  entities: Entity[],
  width: number,
  height: number,
): FarmSaveData {
  const now = Date.now()

  // Check if farm exists (for updatedAt)
  const existing = loadFarm(id)

  const farmData: FarmSaveData = {
    id,
    name,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    version: CURRENT_VERSION,
    data: {
      groundTiles: Array.from(groundTiles.entries()),
      entities,
      width,
      height,
    },
  }

  // Save farm data
  localStorage.setItem(deviceKey("farm-" + id), JSON.stringify(farmData))

  // Update farm list
  const list = listFarms()
  const existingIndex = list.findIndex((f) => f.id === id)
  const listItem: FarmListItem = { id, name, updatedAt: now }

  if (existingIndex >= 0) {
    list[existingIndex] = listItem
  } else {
    list.push(listItem)
  }

  localStorage.setItem(deviceKey("farms"), JSON.stringify(list))

  return farmData
}

/**
 * Load a farm from localStorage by ID
 */
export function loadFarm(id: string): FarmSaveData | null {
  const raw = localStorage.getItem(deviceKey("farm-" + id))
    ?? (!saveOwner() && localStorage.getItem("lofi-valley-farm-" + id))
  if (!raw) return null

  try {
    return JSON.parse(raw) as FarmSaveData
  } catch {
    return null
  }
}

/**
 * List all saved farms (metadata only)
 */
export function listFarms(): FarmListItem[] {
  const raw = localStorage.getItem(deviceKey("farms"))
    ?? (!saveOwner() && localStorage.getItem("lofi-valley-farms"))
  if (!raw) return []

  try {
    return JSON.parse(raw) as FarmListItem[]
  } catch {
    return []
  }
}

/**
 * Delete a farm from localStorage
 */
export function deleteFarm(id: string): void {
  localStorage.removeItem(deviceKey("farm-" + id))

  const list = listFarms().filter((f) => f.id !== id)
  localStorage.setItem(deviceKey("farms"), JSON.stringify(list))
}

/**
 * Convert GroundTile entries back to Map
 */
export function entriesToGroundTiles(
  entries: [string, GroundTile][],
): Map<string, GroundTile> {
  return new Map(entries)
}

// ============ URL SHARING ============

/**
 * Create a shareable URL for a farm
 * Returns null if data is too large
 */
export function createShareUrl(farm: FarmSaveData): string | null {
  try {
    const json = JSON.stringify(farm)
    const base64 = btoa(encodeURIComponent(json))

    // Check URL length limit (~2000 chars safe)
    if (base64.length > 1800) {
      console.warn("Farm data too large for URL sharing")
      return null
    }

    const url = new URL(window.location.href)
    url.searchParams.set("farm", base64)
    url.hash = "/farm_laboratory"
    return url.toString()
  } catch (e) {
    console.error("Failed to create share URL:", e)
    return null
  }
}

/**
 * Parse farm data from current URL hash
 */
export function parseFarmFromUrl(): FarmSaveData | null {
  try {
    const hash = window.location.hash
    const base64 = new URL(window.location.href).searchParams.get("farm")
      ?? (hash.startsWith("#farm=") ? hash.slice(6) : null)
    if (!base64) return null
    const json = decodeURIComponent(atob(base64))
    return JSON.parse(json) as FarmSaveData
  } catch (e) {
    console.error("Failed to parse farm from URL:", e)
    return null
  }
}

/**
 * Download farm as JSON file (fallback for large farms)
 */
export function downloadFarmAsFile(farm: FarmSaveData): void {
  const json = JSON.stringify(farm, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${farm.name.replace(/[^\p{L}\p{N}\p{M} ._-]/gu, "_") || "sea-farm"}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Import farm from JSON file
 */
export function importFarmFromFile(file: File): Promise<FarmSaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const farm = JSON.parse(json)
        // The original designer also accepts older exports without grid dimensions.
        if (farm?.data && typeof farm.data === "object") {
          farm.version ??= 1
          farm.data.width ??= 16
          farm.data.height ??= 16
        }
        if (!isFarm(farm)) throw new Error("Invalid reef")
        resolve(farm)
      } catch (err) {
        reject(new Error("Invalid farm file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

/**
 * Generate a new unique farm ID
 */
export function generateFarmId(): string {
  return crypto.randomUUID()
}
