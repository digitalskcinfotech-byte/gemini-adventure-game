export enum GameState {
  MENU,
  PLAYING,
  DIALOG,
  PAUSED
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  IDLE
}

export enum TileType {
  GRASS = 0,
  WATER = 1,
  WALL = 2,
  FLOOR = 3,
  TREE = 4,
  SAND = 5
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: 'npc' | 'item' | 'hero';
  x: number; // Grid X if tile based, or World X
  y: number;
  color: string;
  name: string;
  interactable: boolean;
  dialogueContext?: string; // Prompt context for Gemini
  sprite?: string; // Emoji representation for simplicity
}

export interface WorldMap {
  width: number;
  height: number;
  tiles: number[]; // Flattened array
  entities: Entity[];
}

export interface GameContext {
  playerPos: Point;
  questLog: string[];
  inventory: string[];
}