import { SpriteSheetData } from "../spritesheetData"
import type { SheetSprite } from "./winterSprites"

export const RESOURCES_CHEST_DATA: SpriteSheetData<{
  sprites: SheetSprite[]
}> = {
  meta: {
    src: "resources/Chest.png",
    width: 240,
    height: 96,
    category: "Custom",
    tileWidth: 16,
    tileHeight: 16,
  },
  sprites: [
    {
      id: "chest",
      name: "Dive Locker",
      region: { x: 1, y: 1, width: 1, height: 1 },
      collision: { width: 1, height: 1 },
      minimapColor: "#d38c9b",
      category: "decoration",
    },
  ],
}
