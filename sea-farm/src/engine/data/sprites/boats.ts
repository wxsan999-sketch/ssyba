import { SpriteSheetData } from "../spritesheetData"
import type { SheetSprite } from "./winterSprites"

export const DECORATIONS_BOATS_DATA: SpriteSheetData<{
  sprites: SheetSprite[]
}> = {
  meta: {
    src: "decorations/boats.png",
    width: 144,
    height: 96,
    category: "Custom",
    tileWidth: 16,
    tileHeight: 16,
  },
  sprites: [
    {
      id: "boat-1",
      name: "Survey Sub 1",
      region: { x: 0, y: 0, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "boat-2",
      name: "Survey Sub 2",
      region: { x: 3, y: 0, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "boat-3",
      name: "Survey Sub 3",
      region: { x: 0, y: 2, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "boat-4",
      name: "Survey Sub 4",
      region: { x: 3, y: 2, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "boat-5",
      name: "Survey Sub 5",
      region: { x: 0, y: 4, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "boat-6",
      name: "Survey Sub 6",
      region: { x: 3, y: 4, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
    {
      id: "boat-7",
      name: "Survey Sub 7",
      region: { x: 6, y: 4, width: 3, height: 2 },
      collision: { width: 1, height: 1, offsetX: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
  ],
}
