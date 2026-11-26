import { ITEM_DEFINITIONS, ItemType } from "@/constants/items"
import { MARKET_CATALOG, STARTER_CROP_ID } from "./economyData"
import type { CropEntity } from "./interfaces/crops"
import type { Entity } from "./interfaces/entity"
import { changeItemQuantity, inventoryActions, inventoryStore, type InventoryState } from "./inventoryStore"
import { worldStore } from "./store"

export { MARKET_CATALOG, STARTER_CROP_ID }
export type TradeResult = "ok" | "invalid" | "locked" | "funds" | "stock" | "full"

const listings = new Map(MARKET_CATALOG.map(entry => [entry.cropId, entry]))

export function buyCulture(cropId: string, quantity = 1): TradeResult {
  const entry = listings.get(cropId)
  if (!entry || !Number.isSafeInteger(quantity) || quantity <= 0) return "invalid"
  const state = inventoryStore.getState()
  if (state.economy.totalSales < entry.unlockAt) return "locked"
  const cost = quantity * entry.buyPrice
  if (cost > state.economy.balance) return "funds"
  const pack = changeItemQuantity(state, entry.seedId, quantity)
  if (!pack) return "full"
  inventoryStore.setState({ ...pack, economy: { ...state.economy, balance: state.economy.balance - cost } })
  return "ok"
}

export function sellHarvest(cropId: string, quantity = 1): TradeResult {
  const entry = listings.get(cropId)
  if (!entry || !Number.isSafeInteger(quantity) || quantity <= 0) return "invalid"
  const state = inventoryStore.getState()
  const pack = changeItemQuantity(state, entry.harvestId, -quantity)
  if (!pack) return "stock"
  const revenue = quantity * entry.sellPrice
  const balance = state.economy.balance + revenue
  const totalSales = state.economy.totalSales + revenue
  if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(totalSales)) return "invalid"
  inventoryStore.setState({ ...pack, economy: { balance, totalSales } })
  return "ok"
}

export function canCollectStarter(state: InventoryState, entities: Entity[]): boolean {
  const starter = listings.get(STARTER_CROP_ID)!
  if (state.economy.balance >= starter.buyPrice) return false
  const hasCrops = entities.some(entity => entity.type === "crop" && !(entity as CropEntity).isDead)
  if (hasCrops) return false
  return !state.slots.some(slot => {
    if (!slot || slot.quantity <= 0) return false
    const type = ITEM_DEFINITIONS[slot.id]?.type
    return type === ItemType.SEED || type === ItemType.HARVEST
  })
}

export function collectStarter(): TradeResult {
  if (!canCollectStarter(inventoryStore.getState(), worldStore.getState().entities)) return "invalid"
  return inventoryActions.addItem(listings.get(STARTER_CROP_ID)!.seedId, 1) ? "ok" : "full"
}
