import { createStore } from "zustand/vanilla"

import { ITEM_DEFINITIONS, type Item } from "@/constants/items"
import { initialEconomy, MARKET_CATALOG, STARTER_CROP_ID, type EconomyState } from "./economyData"

export interface InventoryItem {
  id: string
  quantity: number
}

export interface InventoryState {
  slots: (InventoryItem | null)[]
  itemsMap: Map<string, InventoryItem>
  isInventoryOpen: boolean
  economy: EconomyState
}

export function buildItemsMap(slots: InventoryState["slots"]) {
  const items = new Map<string, InventoryItem>()
  for (const item of slots) {
    if (!item) continue
    const previous = items.get(item.id)
    items.set(item.id, previous ? { id: item.id, quantity: previous.quantity + item.quantity } : item)
  }
  return items
}

const startingSlots: InventoryState["slots"] = Array(30).fill(null)
const starter = MARKET_CATALOG.find(entry => entry.cropId === STARTER_CROP_ID)!
startingSlots[0] = { id: starter.seedId, quantity: 3 }

export const inventoryStore = createStore<InventoryState>(() => ({
  slots: startingSlots,
  itemsMap: buildItemsMap(startingSlots),
  isInventoryOpen: false,
  economy: initialEconomy(),
}))

// Plan the complete inventory change before applying it. A partial stack or a
// full pack must never consume money or destroy an uncollected harvest.
export function changeItemQuantity(state: InventoryState, id: string, delta: number) {
  const definition = ITEM_DEFINITIONS[id]
  if (!definition || !Number.isSafeInteger(delta) || delta === 0) return null
  const resultQuantity = (state.itemsMap.get(id)?.quantity ?? 0) + delta
  if (resultQuantity < 0 || !Number.isSafeInteger(resultQuantity)) return null

  const slots = [...state.slots]
  let remaining = Math.abs(delta)
  if (delta < 0) {
    for (let index = slots.length - 1; index >= 0 && remaining > 0; index--) {
      const item = slots[index]
      if (item?.id !== id) continue
      const take = Math.min(remaining, item.quantity)
      slots[index] = take === item.quantity ? null : { id, quantity: item.quantity - take }
      remaining -= take
    }
  } else {
    const limit = definition.maxStack ?? 1
    for (let index = 0; index < slots.length && remaining > 0; index++) {
      const item = slots[index]
      if (item?.id !== id || item.quantity >= limit) continue
      const add = Math.min(remaining, limit - item.quantity)
      slots[index] = { id, quantity: item.quantity + add }
      remaining -= add
    }
    for (let index = 0; index < slots.length && remaining > 0; index++) {
      if (slots[index] !== null) continue
      const add = Math.min(remaining, limit)
      slots[index] = { id, quantity: add }
      remaining -= add
    }
  }
  return remaining === 0 ? { slots, itemsMap: buildItemsMap(slots) } : null
}

function updateQuantity(id: string, delta: number): boolean {
  const change = changeItemQuantity(inventoryStore.getState(), id, delta)
  if (!change) return false
  inventoryStore.setState(change)
  return true
}

export const inventoryActions = {
  addItem: (id: string, quantity: number) =>
    quantity > 0 && updateQuantity(id, quantity),
  removeItem: (id: string, quantity: number) =>
    quantity > 0 && updateQuantity(id, -quantity),

  moveItem: (fromIndex: number, toIndex: number) => {
    const { slots } = inventoryStore.getState()
    if (![fromIndex, toIndex].every(i => Number.isInteger(i) && i >= 0 && i < slots.length)) return
    const next = [...slots]
    next[fromIndex] = slots[toIndex]
    next[toIndex] = slots[fromIndex]
    inventoryStore.setState({ slots: next, itemsMap: buildItemsMap(next) })
  },

  getItem: (id: string) => inventoryStore.getState().itemsMap.get(id),
  getItemDefinition: (id: string): Item | undefined => ITEM_DEFINITIONS[id],
  hasItem: (id: string, quantity: number) =>
    Number.isSafeInteger(quantity) && quantity > 0
    && (inventoryStore.getState().itemsMap.get(id)?.quantity ?? 0) >= quantity,

  toggleInventory: () => inventoryStore.setState(s => ({ isInventoryOpen: !s.isInventoryOpen })),
  openInventory: () => inventoryStore.setState({ isInventoryOpen: true }),
  closeInventory: () => inventoryStore.setState({ isInventoryOpen: false }),
}

export const getAllItems = (state: InventoryState) => state.slots
export const getItemsMap = (state: InventoryState) => state.itemsMap
export const getIsInventoryOpen = (state: InventoryState) => state.isInventoryOpen
