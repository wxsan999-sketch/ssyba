import type { SpriteSheetData } from "./spritesheetData"

export interface Crop {
  id: string
  name: string
  spanishName: string
  isFantasy: boolean
  growthStages: number
  tallStages: number[]
  lifeCycle: {
    isPerennial: boolean
    growthTimePerStage: number
    waterCheckInterval: number
    deathTimeWithoutWater: number
    deathTimeWithoutHarvest: number
  }
  harvest: {
    maxHarvests: number
    minDrops: number
    maxDrops: number
  }
  items: {
    seedId: string
    seedName: string
    harvestId: string
    harvestName: string
  }
}

export const DEFAULT_LIFECYCLE = {
  isPerennial: false,
  growthTimePerStage: 5,
  waterCheckInterval: 48,
  deathTimeWithoutWater: Infinity,
  deathTimeWithoutHarvest: Infinity,
}

export const DEFAULT_HARVEST = {
  maxHarvests: 1,
  minDrops: 1,
  maxDrops: 2,
}

export const ITEM_DEFAULTS = {
  seed: { stackable: true, maxStack: 99 },
  harvest: { stackable: true, maxStack: 999 },
}

// Helper to generate item IDs from crop ID
function createItems(cropId: string, name: string) {
  const base = cropId.replace("-crop", "")
  return {
    seedId: `${base}-seed`,
    seedName: `${name} Culture`,
    harvestId: `${base}-harvest`,
    harvestName: name,
  }
}

export const CROPS_DATA: SpriteSheetData<{ crops: Crop[] }> = {
  meta: {
    src: "cropsV2.png",
    width: 256,
    height: 528,
    category: "Sea Garden",
  },
  crops: [
    {
      id: "corn-crop",
      name: "Giant Kelp",
      spanishName: "Kelp gigante",
      isFantasy: false,
      tallStages: [5, 6],
      growthStages: 6,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 24 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("corn-crop", "Giant Kelp"),
    },
    {
      id: "carrot-crop",
      name: "Sea Grapes",
      spanishName: "Uvas de mar",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 8 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("carrot-crop", "Sea Grapes"),
    },
    {
      id: "cauliflower-crop",
      name: "Pearl Bubble Algae",
      spanishName: "Alga burbuja perla",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 16 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("cauliflower-crop", "Pearl Bubble Algae"),
    },
    {
      id: "purple-onion-crop",
      name: "Purple Dulse",
      spanishName: "Dulse púrpura",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 12 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("purple-onion-crop", "Purple Dulse"),
    },
    {
      id: "eggplant-crop",
      name: "Velvet Hornweed",
      spanishName: "Codium aterciopelado",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 18 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("eggplant-crop", "Velvet Hornweed"),
    },
    {
      id: "blue-flower-crop",
      name: "Peacock Weed",
      spanishName: "Alga pavo real",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 6 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("blue-flower-crop", "Peacock Weed"),
    },
    {
      id: "lettuce-crop",
      name: "Sea Lettuce",
      spanishName: "Lechuga de mar",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 4 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("lettuce-crop", "Sea Lettuce"),
    },
    {
      id: "wheat-crop",
      name: "Eelgrass",
      spanishName: "Zostera marina",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 20 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("rice-crop", "Eelgrass"),
    },
    {
      id: "pumpkin-crop",
      name: "Bull Kelp",
      spanishName: "Kelp de bulbo",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 40 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("pumpkin-crop", "Bull Kelp"),
    },
    {
      id: "turnip-crop",
      name: "Red Gracilaria",
      spanishName: "Gracilaria roja",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 10 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("turnip-crop", "Red Gracilaria"),
    },
    {
      id: "cabbage-crop",
      name: "Wakame",
      spanishName: "Wakame",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 14 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("cabbage-crop", "Wakame"),
    },
    {
      id: "radish-crop",
      name: "Sea Whistle",
      spanishName: "Silbato de mar",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 5 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("radish-crop", "Sea Whistle"),
    },
    {
      id: "blue-star-crop",
      name: "Starlight Coralline",
      spanishName: "Coralina estelar",
      isFantasy: true,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 72 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("blue-star-crop", "Starlight Coralline"),
    },
    {
      id: "cucumber-crop",
      name: "Oarweed",
      spanishName: "Laminaria digitada",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 9 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("cucumber-crop", "Oarweed"),
    },
    {
      id: "sunflower-crop",
      name: "Golden Sea Fan",
      spanishName: "Abanico de mar dorado",
      isFantasy: false,
      tallStages: [4, 5],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 22 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("sunflower-crop", "Golden Sea Fan"),
    },
    {
      id: "ginger-crop",
      name: "Irish Moss",
      spanishName: "Musgo de Irlanda",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 28 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("ginger-crop", "Irish Moss"),
    },
    {
      id: "potato-crop",
      name: "Neptune's Shaving Brush",
      spanishName: "Brocha de Neptuno",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 15 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("potato-crop", "Neptune's Shaving Brush"),
    },
    {
      id: "watermelon-crop",
      name: "Sailor's Eyeball",
      spanishName: "Ojo de marinero",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 48 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("watermelon-crop", "Sailor's Eyeball"),
    },
    {
      id: "starfruit-crop",
      name: "Tide Lantern",
      spanishName: "Farol de marea",
      isFantasy: true,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 80 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("starfruit-crop", "Tide Lantern"),
    },
    {
      id: "moonflower-crop",
      name: "Moonlace",
      spanishName: "Encaje de luna",
      isFantasy: true,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 96 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("moonflower-crop", "Moonlace"),
    },
    {
      id: "banana-crop",
      name: "Ribbon Kelp",
      spanishName: "Kelp de cinta",
      isFantasy: false,
      tallStages: [4, 5],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 32 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("banana-crop", "Ribbon Kelp"),
    },
    {
      id: "pineapple-crop",
      name: "Feather Caulerpa",
      spanishName: "Caulerpa plumosa",
      isFantasy: false,
      tallStages: [4, 5],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 56 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("pineapple-crop", "Feather Caulerpa"),
    },
    {
      id: "melon-crop",
      name: "Sea Palm",
      spanishName: "Palmera de mar",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 36 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("melon-crop", "Sea Palm"),
    },
    {
      id: "garlic-crop",
      name: "Mermaid's Wineglass",
      spanishName: "Copa de sirena",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 17 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("garlic-crop", "Mermaid's Wineglass"),
    },
    {
      id: "red-pepper-crop",
      name: "Ruby Sea Plume",
      spanishName: "Pluma de mar rubí",
      isFantasy: false,
      tallStages: [4, 5],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 26 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("red-pepper-crop", "Ruby Sea Plume"),
    },
    {
      id: "rare-crop",
      name: "Sargassum",
      spanishName: "Sargazo",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 7 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("rare-crop", "Sargassum"),
    },
    {
      id: "blue-carrot-crop",
      name: "Sapphire Spiralkelp",
      spanishName: "Kelp zafiro en espiral",
      isFantasy: true,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 64 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("blue-carrot-crop", "Sapphire Spiralkelp"),
    },
    {
      id: "broccoli-crop",
      name: "Calcified Fanweed",
      spanishName: "Halimeda",
      isFantasy: false,
      tallStages: [],
      growthStages: 5,
      lifeCycle: { ...DEFAULT_LIFECYCLE, growthTimePerStage: 13 },
      harvest: { ...DEFAULT_HARVEST },
      items: createItems("broccoli-crop", "Calcified Fanweed"),
    },
  ],
}
