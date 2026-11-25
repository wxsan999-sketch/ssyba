import { CROPS_DATA } from "./data/cropsData"

export interface EconomyState {
  balance: number
  totalSales: number
}

export function initialEconomy(): EconomyState {
  return { balance: 40, totalSales: 0 }
}

export function isEconomy(value: unknown): value is EconomyState {
  if (!value || typeof value !== "object") return false
  const { balance, totalSales } = value as Partial<EconomyState>
  return typeof balance === "number" && Number.isSafeInteger(balance) && balance >= 0
    && typeof totalSales === "number" && Number.isSafeInteger(totalSales) && totalSales >= 0
}

export const STARTER_CROP_ID = "lettuce-crop"

function unlockThreshold(growMinutes: number): number {
  if (growMinutes <= 48) return 0
  if (growMinutes <= 110) return 60
  if (growMinutes <= 220) return 240
  return 600
}

export const MARKET_CATALOG = CROPS_DATA.crops.map(crop => {
  const growMinutes = (crop.growthStages - 1) * crop.lifeCycle.growthTimePerStage
  const buyPrice = Math.max(3, Math.ceil(growMinutes / 6))
  return {
    cropId: crop.id,
    seedId: crop.items.seedId,
    harvestId: crop.items.harvestId,
    buyPrice,
    sellPrice: buyPrice + Math.max(2, Math.ceil(buyPrice / 2)),
    unlockAt: unlockThreshold(growMinutes),
    growMinutes,
  }
}).sort((a, b) => a.growMinutes - b.growMinutes)
