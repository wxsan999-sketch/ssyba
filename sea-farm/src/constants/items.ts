import type { TFunction } from "i18next"
import { CROPS_DATA, ITEM_DEFAULTS } from "@/engine/data/cropsData"
import type { Tool } from "@/engine/store"

/**
 * Tipos de items (NO magic strings)
 */
export enum ItemType {
  TOOL = "tool",
  SEED = "seed",
  HARVEST = "harvest",
  RESOURCE = "resource",
  CONSUMABLE = "consumable",
}

/**
 * Item base
 */
export interface Item {
  id: string
  type: ItemType
  name: string
  emoji: string
  stackable: boolean
  maxStack?: number
  // For seeds/harvests - links to crop for sprite rendering
  relatedCropId?: string
}

/**
 * Slot en el inventario
 */
export interface InventorySlot {
  item: Item | null
  quantity: number
}

// ==================== HERRAMIENTAS ====================
const TOOL_ITEMS: Record<string, Item> = {
  axe: {
    id: "axe",
    type: ItemType.TOOL,
    name: "Kelp Knife",
    emoji: "🔪",
    stackable: false,
  },
  pickaxe: {
    id: "pickaxe",
    type: ItemType.TOOL,
    name: "Reef Pick",
    emoji: "⛏️",
    stackable: false,
  },
  hoe: {
    id: "hoe",
    type: ItemType.TOOL,
    name: "Sand Rake",
    emoji: "🔱",
    stackable: false,
  },
  wateringCan: {
    id: "wateringCan",
    type: ItemType.TOOL,
    name: "Nutrient Pump",
    emoji: "🫧",
    stackable: false,
  },
  scythe: {
    id: "scythe",
    type: ItemType.TOOL,
    name: "Harvest Shears",
    emoji: "✂️",
    stackable: false,
  },
}

// ==================== RECURSOS ====================
const RESOURCE_ITEMS: Record<string, Item> = {
  wood: {
    id: "wood",
    type: ItemType.RESOURCE,
    name: "Kelp Fiber",
    emoji: "🪢",
    stackable: true,
    maxStack: 99,
  },
  stone: {
    id: "stone",
    type: ItemType.RESOURCE,
    name: "Reef Stone",
    emoji: "🪨",
    stackable: true,
    maxStack: 99,
  },
}

// ==================== AUTO-GENERATED CROP ITEMS ====================
function generateCropItems(): Record<string, Item> {
  const items: Record<string, Item> = {}

  for (const crop of CROPS_DATA.crops) {
    // Generate seed item
    items[crop.items.seedId] = {
      id: crop.items.seedId,
      type: ItemType.SEED,
      name: crop.items.seedName,
      emoji: "🧪",
      stackable: ITEM_DEFAULTS.seed.stackable,
      maxStack: ITEM_DEFAULTS.seed.maxStack,
      relatedCropId: crop.id,
    }

    // Generate harvest item
    items[crop.items.harvestId] = {
      id: crop.items.harvestId,
      type: ItemType.HARVEST,
      name: crop.items.harvestName,
      emoji: "🪸",
      stackable: ITEM_DEFAULTS.harvest.stackable,
      maxStack: ITEM_DEFAULTS.harvest.maxStack,
      relatedCropId: crop.id,
    }
  }

  return items
}

const CROP_ITEMS = generateCropItems()

/**
 * Definiciones de todos los items del juego
 */
export const ITEM_DEFINITIONS: Record<string, Item> = {
  ...TOOL_ITEMS,
  ...RESOURCE_ITEMS,
  ...CROP_ITEMS,
}

/**
 * Constantes de índices para acceso a slots
 */
export const HOTBAR1_START = 0
export const HOTBAR1_END = 4
export const HOTBAR2_START = 5
export const HOTBAR2_END = 14
export const MAIN_INVENTORY_START = 15
export const MAIN_INVENTORY_END = 23

/**
 * Helpers para obtener items por tipo
 */
export const getToolItem = (toolId: Tool): Item | undefined => {
  return ITEM_DEFINITIONS[toolId]
}

export function getItemLabel(id: string, t: TFunction<"crops">): string {
  const item = ITEM_DEFINITIONS[id]
  if (!item) return id
  if (!item.relatedCropId) return t(`gear.${id}`, { defaultValue: item.name })
  const name = t(`species.${item.relatedCropId}`)
  return item.type === ItemType.SEED ? t("cultureName", { name }) : name
}
