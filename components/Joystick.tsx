import React, { useEffect, useRef, useState } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  onStop: () => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const baseRadius = 50; // Half of w-24 (96px) roughly
  const stickRadius = 24; 

  const handleStart = (clientX: number, clientY: number) => {
    setActive(true);
    updateStick(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!active) return;
    updateStick(clientX, clientY);
  };

  const handleEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onStop();
  };

  const updateStick = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDist = baseRadius - stickRadius;

    if (distance > maxDist) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxDist;
      deltaY = Math.sin(angle) * maxDist;
    }

    setPosition({ x: deltaX, y: deltaY });

    // Normalize output to -1 to 1
    onMove(deltaX / maxDist, deltaY / maxDist);
  };

  // Touch handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div 
      ref={containerRef}
      className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20 touch-none"
    >
      <div 
        ref={stickRef}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: active ? 'none' : 'transform 0.1s ease-out'
        }}
        className={`absolute top-1/2 left-1/2 -ml-6 -mt-6 w-12 h-12 rounded-full shadow-lg ${
          active ? 'bg-blue-500' : 'bg-white/50'
        }`}
      />
    </div>
  );
};

export default Joystick;