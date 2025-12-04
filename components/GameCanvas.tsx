import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WorldMap, TileType, Point, Direction, GameState, Entity } from '../types';
import { TILE_SIZE, COLORS, INITIAL_WORLD } from '../constants';
import Joystick from './Joystick';
import { Sword, Hand, MessageSquare } from 'lucide-react';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onInteract: (entity: Entity) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState<Point>({ x: 3, y: 3 });
  const [joystickVec, setJoystickVec] = useState<Point>({ x: 0, y: 0 });
  
  // Game Loop Refs to avoid closure staleness
  const playerPosRef = useRef(playerPos);
  const joystickRef = useRef(joystickVec);
  const mapRef = useRef<WorldMap>(INITIAL_WORLD);
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Sync state to refs
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { joystickRef.current = joystickVec; }, [joystickVec]);

  // Movement & Collision Logic
  const updatePhysics = (dt: number) => {
    if (gameState !== GameState.PLAYING) return;

    const speed = 0.008 * dt; // tiles per ms
    const input = joystickRef.current;

    if (input.x === 0 && input.y === 0) return;

    const currentPos = playerPosRef.current;
    let nextX = currentPos.x + input.x * speed;
    let nextY = currentPos.y + input.y * speed;

    // Collision Check (Simple box vs tile center)
    // We check the tile the player is trying to enter
    const checkCollision = (x: number, y: number) => {
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);
      
      // Bounds
      if (tileX < 0 || tileX >= mapRef.current.width || tileY < 0 || tileY >= mapRef.current.height) {
        return true;
      }

      // Tile Types
      const tileIndex = tileY * mapRef.current.width + tileX;
      const tileType = mapRef.current.tiles[tileIndex];
      const solidTypes = [TileType.WALL, TileType.TREE, TileType.WATER];
      
      if (solidTypes.includes(tileType)) return true;

      // Entities (Simple check)
      // Note: In a real game, use a spatial hash or quadtree
      for (const ent of mapRef.current.entities) {
        // Simple distance check for solid entities? 
        // For now let's say entities are walkable but interactable, 
        // or just tiny bit of collision
      }

      return false;
    };

    // Axis-independent collision for sliding along walls
    if (!checkCollision(nextX, currentPos.y)) {
      currentPos.x = nextX;
    }
    if (!checkCollision(currentPos.x, nextY)) {
      currentPos.y = nextY;
    }

    setPlayerPos({ ...currentPos });
  };

  // Rendering
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0f172a'; // bg-slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const map = mapRef.current;
    const player = playerPosRef.current;

    // Camera follow logic
    // Center player in screen
    const screenTilesX = canvas.width / TILE_SIZE;
    const screenTilesY = canvas.height / TILE_SIZE;
    
    const camX = player.x - screenTilesX / 2;
    const camY = player.y - screenTilesY / 2;

    // Draw Map
    const startX = Math.floor(camX);
    const startY = Math.floor(camY);
    const endX = startX + screenTilesX + 1;
    const endY = startY + screenTilesY + 1;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (x < 0 || x >= map.width || y < 0 || y >= map.height) continue;

        const tileIndex = y * map.width + x;
        const tileType = map.tiles[tileIndex];
        
        const drawX = (x - camX) * TILE_SIZE;
        const drawY = (y - camY) * TILE_SIZE;

        // Base tile color
        ctx.fillStyle = COLORS[tileType];
        // Add subtle variation to prevent boring look
        if ((x + y) % 2 === 0) ctx.filter = 'brightness(1.05)';
        ctx.fillRect(Math.floor(drawX), Math.floor(drawY), TILE_SIZE + 1, TILE_SIZE + 1); // +1 to fix subpixel gaps
        ctx.filter = 'none';

        // Details
        if (tileType === TileType.TREE) {
           ctx.fillStyle = '#064e3b'; // Darker green center
           ctx.beginPath();
           ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
           ctx.fill();
        }
        if (tileType === TileType.WATER) {
           ctx.fillStyle = '#ffffff'; 
           ctx.globalAlpha = 0.2;
           ctx.fillRect(drawX + 4, drawY + 8, TILE_SIZE - 20, 4);
           ctx.globalAlpha = 1.0;
        }
      }
    }

    // Draw Entities
    map.entities.forEach(ent => {
      const drawX = (ent.x - camX) * TILE_SIZE;
      const drawY = (ent.y - camY) * TILE_SIZE;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(drawX + TILE_SIZE/2, drawY + TILE_SIZE - 4, TILE_SIZE/3, TILE_SIZE/6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sprite placeholder (Emoji text is easiest for pure canvas without loading assets)
      ctx.font = `${TILE_SIZE * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ent.sprite || '❓', drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
    });

    // Draw Player
    const pDrawX = (player.x - camX) * TILE_SIZE;
    const pDrawY = (player.y - camY) * TILE_SIZE;

    // Player Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(pDrawX + TILE_SIZE/2, pDrawY + TILE_SIZE - 2, TILE_SIZE/3, TILE_SIZE/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player Body
    ctx.fillStyle = '#ef4444'; // Red Hero
    ctx.beginPath();
    ctx.arc(pDrawX + TILE_SIZE/2, pDrawY + TILE_SIZE/2 - 4, TILE_SIZE/3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(pDrawX + TILE_SIZE/2 - 6, pDrawY + TILE_SIZE/2 - 8, 4, 4);
    ctx.fillRect(pDrawX + TILE_SIZE/2 + 2, pDrawY + TILE_SIZE/2 - 8, 4, 4);

    // Interaction Hint
    // Find closest entity
    const closest = getClosestEntity();
    if (closest && closest.dist < 1.5) {
      const eX = (closest.entity.x - camX) * TILE_SIZE;
      const eY = (closest.entity.y - camY) * TILE_SIZE;
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(eX + TILE_SIZE/2, eY - 10);
      ctx.lineTo(eX + TILE_SIZE/2 - 5, eY - 20);
      ctx.lineTo(eX + TILE_SIZE/2 + 5, eY - 20);
      ctx.fill();
    }
  };

  const getClosestEntity = (): { entity: Entity; dist: number } | null => {
    let closest = null;
    let minD = Infinity;
    
    for (const ent of mapRef.current.entities) {
      if (!ent.interactable) continue;
      const dx = ent.x - playerPosRef.current.x;
      const dy = ent.y - playerPosRef.current.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < minD) {
        minD = dist;
        closest = ent;
      }
    }
    return closest ? { entity: closest, dist: minD } : null;
  };

  const handleInteraction = () => {
    const closest = getClosestEntity();
    if (closest && closest.dist < 1.5) {
      onInteract(closest.entity);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const keys = new Set<string>();
    const handleKey = (e: KeyboardEvent) => {
      if (e.type === 'keydown') keys.add(e.code);
      if (e.type === 'keyup') keys.delete(e.code);

      let x = 0;
      let y = 0;
      if (keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
      
      // Normalize
      if (x !== 0 || y !== 0) {
        const len = Math.sqrt(x*x + y*y);
        x /= len;
        y /= len;
      }
      
      setJoystickVec({ x, y });

      if (e.type === 'keydown' && (e.code === 'Space' || e.code === 'Enter')) {
        handleInteraction();
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main Loop
  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      updatePhysics(dt);
      render();
      frameIdRef.current = requestAnimationFrame(loop);
    };
    frameIdRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameIdRef.current);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]); // Restart loop if gamestate changes

  // Resize handler
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* UI Overlay */}
      {gameState === GameState.PLAYING && (
        <>
          <div className="absolute bottom-8 left-8">
            <Joystick 
              onMove={(x, y) => setJoystickVec({x, y})} 
              onStop={() => setJoystickVec({x: 0, y: 0})}
            />
          </div>

          <div className="absolute bottom-8 right-8 flex gap-4">
             <button 
                className="w-16 h-16 bg-blue-500/80 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform border-2 border-white/30"
                onClick={handleInteraction}
              >
                <MessageSquare className="text-white w-8 h-8" />
             </button>
             <button 
                className="w-12 h-12 bg-red-500/80 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform border-2 border-white/30 self-end"
                onClick={() => alert("Combat not implemented in prototype")}
              >
                <Sword className="text-white w-6 h-6" />
             </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameCanvas;