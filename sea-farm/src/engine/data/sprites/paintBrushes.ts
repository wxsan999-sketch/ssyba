import { SpriteSheetData } from "../spritesheetData"
import type { SheetSprite } from "./winterSprites"

export const PAINT_BRUSHES_DATA: SpriteSheetData<{
  sprites: SheetSprite[]
}> = {
  meta: {
    src: "autotiling/brushes/paint-brushes.png",
    width: 528,
    height: 144,
    category: "Custom",
    tileWidth: 16,
    tileHeight: 16,
  },
  sprites: [
    {
      id: "darker-grass-terrain-preview",
      name: "Kelp Forest Floor",
      region: { x: 0, y: 0, width: 3, height: 3 },
    },
    {
      id: "grass-terrain-preview",
      name: "Seagrass Meadow",
      region: { x: 6, y: 0, width: 3, height: 3 },
    },
    {
      id: "soil-ground-terrain-preview",
      name: "Shell Sand",
      region: { x: 18, y: 0, width: 3, height: 3 },
    },
    {
      id: "darker-soil-ground-terrain-preview",
      name: "Tidal Silt",
      region: { x: 21, y: 0, width: 3, height: 3 },
    },
    {
      id: "stone-ground-terrain-preview",
      name: "Basalt Shelf",
      region: { x: 24, y: 0, width: 3, height: 3 },
    },
    {
      id: "darker_grass_ground_1",
      name: "Deep Eelgrass",
      region: { x: 0, y: 3, width: 3, height: 3 },
    },
    {
      id: "darker_grass_ground_2",
      name: "Shadow Kelp",
      region: { x: 3, y: 3, width: 3, height: 3 },
    },
    {
      id: "grass_ground_1",
      name: "Ribbon Grass",
      region: { x: 6, y: 3, width: 3, height: 3 },
    },
    {
      id: "grass_ground_2",
      name: "Turtle Grass",
      region: { x: 9, y: 3, width: 3, height: 3 },
    },
    {
      id: "snow_ground_1",
      name: "Pearl Gravel",
      region: { x: 12, y: 3, width: 3, height: 3 },
    },
    {
      id: "snow_ground_2",
      name: "Crushed Shells",
      region: { x: 15, y: 3, width: 3, height: 3 },
    },
    {
      id: "darker_grass_hills",
      name: "Kelp Ridge",
      region: { x: 0, y: 6, width: 3, height: 3 },
    },
    {
      id: "grass_hills",
      name: "Seagrass Ledge",
      region: { x: 6, y: 6, width: 3, height: 3 },
    },
    {
      id: "snow_hills_1",
      name: "Pearl Ridge",
      region: { x: 12, y: 6, width: 3, height: 3 },
    },
    {
      id: "snow_hills_2",
      name: "Shell Ridge",
      region: { x: 15, y: 6, width: 3, height: 3 },
    },
    {
      id: "soil_hills",
      name: "Sandstone Bank",
      region: { x: 18, y: 6, width: 3, height: 3 },
    },
    {
      id: "darker_soil_hills",
      name: "Silt Bank",
      region: { x: 21, y: 6, width: 3, height: 3 },
    },
    {
      id: "stone_hills",
      name: "Basalt Ridge",
      region: { x: 24, y: 6, width: 3, height: 3 },
    },
    {
      id: "dirt",
      name: "Culture Bed",
      region: { x: 27, y: 3, width: 3, height: 3 },
    },
    {
      id: "dirt_wider",
      name: "Wide Culture Bed",
      region: { x: 30, y: 3, width: 3, height: 3 },
    },
  ],
}
