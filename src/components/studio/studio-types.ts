export type WallId = "back" | "left" | "right" | "front";
export type RoomId = "living" | "bedroom" | "dining";
export type LightingId = "day" | "evening" | "night";

export interface WallState {
  design: string | null; // product slug
  scale: number; // pattern scale multiplier
}

export interface StudioState {
  room: RoomId;
  walls: Record<WallId, WallState>;
  paint: string; // base paint for unpapered walls
  lighting: LightingId;
  selectedWall: WallId | null;
}

export const WALL_LABELS: Record<WallId, string> = {
  back: "Back Wall",
  left: "Left Wall",
  right: "Right Wall",
  front: "Front Wall",
};

export const ROOM_LABELS: Record<RoomId, string> = {
  living: "Modern Living Room",
  bedroom: "Minimal Bedroom",
  dining: "Luxury Dining Room",
};

export const PAINT_SWATCHES = [
  { name: "Gallery ivory", value: "#e8e2d4" },
  { name: "Limestone", value: "#d9d0c1" },
  { name: "Sage", value: "#aab09a" },
  { name: "Clay", value: "#c9a187" },
  { name: "Ink", value: "#262624" },
];

export const defaultStudioState = (room: RoomId = "living"): StudioState => ({
  room,
  walls: {
    back: { design: null, scale: 1 },
    left: { design: null, scale: 1 },
    right: { design: null, scale: 1 },
    front: { design: null, scale: 1 },
  },
  paint: "#e8e2d4",
  lighting: "day",
  selectedWall: "back",
});
