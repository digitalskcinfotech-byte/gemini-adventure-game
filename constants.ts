import { TileType, Entity, WorldMap } from './types';

export const TILE_SIZE = 48; // px
export const VIEWPORT_WIDTH = 15; // tiles
export const VIEWPORT_HEIGHT = 10; // tiles
export const MOVEMENT_SPEED = 0.15; // tiles per frame approx

export const COLORS = {
  [TileType.GRASS]: '#4ade80', // green-400
  [TileType.WATER]: '#60a5fa', // blue-400
  [TileType.WALL]: '#64748b',  // slate-500
  [TileType.FLOOR]: '#d6d3d1', // stone-300
  [TileType.TREE]: '#166534',  // green-800
  [TileType.SAND]: '#fde047',  // yellow-300
};

// Simple map generator (20x20)
const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const INITIAL_TILES = new Array(MAP_WIDTH * MAP_HEIGHT).fill(TileType.GRASS);

// Helper to set tiles
const setTile = (x: number, y: number, type: TileType) => {
  if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
    INITIAL_TILES[y * MAP_WIDTH + x] = type;
  }
};

// Generate some terrain
for (let y = 0; y < MAP_HEIGHT; y++) {
  for (let x = 0; x < MAP_WIDTH; x++) {
    // Borders
    if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
      setTile(x, y, TileType.TREE);
    }
    // A river
    if (x > 5 && x < 9 && y > 2 && y < 18) {
       setTile(x, y, TileType.WATER);
    }
    // Bridge
    if (x > 5 && x < 9 && y === 10) {
      setTile(x, y, TileType.FLOOR);
    }
    // House walls
    if (x > 12 && x < 17 && y > 12 && y < 17) {
      setTile(x, y, TileType.WALL);
    }
    // House floor
    if (x > 13 && x < 16 && y > 13 && y < 16) {
      setTile(x, y, TileType.FLOOR);
    }
    // Door
    if (x === 14 && y === 12) setTile(x, y, TileType.FLOOR);
    
    // Random trees
    if (Math.random() > 0.9 && INITIAL_TILES[y * MAP_WIDTH + x] === TileType.GRASS) {
      setTile(x, y, TileType.TREE);
    }
  }
}

const INITIAL_ENTITIES: Entity[] = [
  {
    id: 'npc_elder',
    type: 'npc',
    x: 14.5,
    y: 14.5,
    color: '#a855f7',
    name: 'Elder Oric',
    interactable: true,
    dialogueContext: 'You are Elder Oric, the wise keeper of the village. You are worried about the dark clouds gathering over the Whispering Woods. You need the player to find the Crystal of Dawn.',
    sprite: '🧙‍♂️'
  },
  {
    id: 'npc_guard',
    type: 'npc',
    x: 9.5,
    y: 10.5,
    color: '#94a3b8',
    name: 'Guard',
    interactable: true,
    dialogueContext: 'You are a tired guard watching the bridge. You have heard rumors of slimes in the north.',
    sprite: '🛡️'
  },
  {
    id: 'item_chest',
    type: 'item',
    x: 2.5,
    y: 2.5,
    color: '#f59e0b',
    name: 'Old Chest',
    interactable: true,
    dialogueContext: 'You are an ancient chest describing your contents: a rusty sword and a healing potion.',
    sprite: '📦'
  }
];

export const INITIAL_WORLD: WorldMap = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  tiles: INITIAL_TILES,
  entities: INITIAL_ENTITIES
};