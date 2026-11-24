import { SpriteSheetData } from "../spritesheetData"
import type { SheetSprite } from "./winterSprites"

export const DECORATIONS_SLOPES_DATA: SpriteSheetData<{
  sprites: SheetSprite[]
}> = {
  meta: {
    src: "decorations/slopes.png",
    width: 192,
    height: 96,
    category: "Custom",
    tileWidth: 16,
    tileHeight: 16,
  },
  sprites: [
    {
      id: "darker-grass-slope-1",
      name: "Deep Kelp Ramp 1",
      region: { x: 0, y: 0, width: 2, height: 2 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "darker-grass-slope-2",
      name: "Deep Kelp Ramp 2",
      region: { x: 2, y: 0, width: 2, height: 3 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "darker-grass-slope-3",
      name: "Deep Kelp Ramp 3",
      region: { x: 4, y: 0, width: 2, height: 3 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "grass-slope-",
      name: "Seagrass Ramp",
      region: { x: 0, y: 3, width: 2, height: 2 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "grass-slope-2",
      name: "Seagrass Ramp 2",
      region: { x: 2, y: 3, width: 2, height: 3 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "grass-slope-3",
      name: "Seagrass Ramp 3",
      region: { x: 4, y: 3, width: 2, height: 3 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "soil-slope",
      name: "Sand Ramp",
      region: { x: 6, y: 0, width: 2, height: 2 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "darker-soil-slope",
      name: "Silt Ramp",
      region: { x: 8, y: 0, width: 2, height: 2 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "stone-ground-slope",
      name: "Basalt Ramp",
      region: { x: 10, y: 0, width: 2, height: 2 },
      collision: { width: 0, height: 0 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
  ],
}
