
import React, { useEffect, useState } from 'react';
import { Tile, SpecialType, BlockerType, CandyColor } from '../types';
import { COLOR_MAP } from '../constants';

interface TileComponentProps {
  tile: Tile;
  onPointerDown: (e: React.PointerEvent, tile: Tile) => void;
  isSelected: boolean;
  isNeighbor: boolean;
  offset: { x: number; y: number };
  isMatched: boolean;
}

const TileComponent: React.FC<TileComponentProps> = ({ 
  tile, 
  onPointerDown, 
  isSelected, 
  isNeighbor,
  offset,
  isMatched
}) => {
  const [isEntering, setIsEntering] = useState(tile.isNew);
  const isColorBomb = tile.special === SpecialType.COLOR_BOMB;

  useEffect(() => {
    if (tile.isNew) {
      // Trigger the "falling from top" animation after mounting
      const timer = setTimeout(() => setIsEntering(false), 50);
      return () => clearTimeout(timer);
    }
  }, [tile.isNew]);

  const getSpecialIcon = () => {
    switch (tile.special) {
      case SpecialType.STRIPED_H:
        return (
          <div className="absolute inset-0 flex flex-col justify-around py-1">
            <div className="w-full h-1 bg-white opacity-60"></div>
            <div className="w-full h-1 bg-white opacity-60"></div>
            <div className="w-full h-1 bg-white opacity-60"></div>
          </div>
        );
      case SpecialType.STRIPED_V:
        return (
          <div className="absolute inset-0 flex justify-around px-1">
            <div className="h-full w-1 bg-white opacity-60"></div>
            <div className="h-full w-1 bg-white opacity-60"></div>
            <div className="h-full w-1 bg-white opacity-60"></div>
          </div>
        );
      case SpecialType.WRAPPED:
        return <div className="absolute inset-1 border-[6px] border-white/30 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.5)]"></div>;
      default:
        return null;
    }
  };

  const getBlockerOverlay = () => {
    switch (tile.blocker) {
      case BlockerType.ICE:
        return (
          <div className="absolute inset-0 bg-blue-100/40 border-2 border-white/60 rounded-md flex items-center justify-center pointer-events-none z-40">
            <div className="w-4 h-4 text-white opacity-80 drop-shadow-md">❄️</div>
          </div>
        );
      case BlockerType.LOCK:
        return (
          <div className="absolute inset-0 bg-gray-900/40 border-2 border-gray-400/60 rounded-md flex items-center justify-center pointer-events-none z-40">
            <div className="text-white text-xs drop-shadow-md">⛓️</div>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine transition timing: 
  // - Fast for matching disappearances
  // - Bouncy for falling
  // - Instant for dragging
  const isDragging = offset.x !== 0 || offset.y !== 0;
  
  // Stagger the falling bounce based on column to make it look "organic"
  const fallDelay = isMatched ? 0 : (tile.y * 20);

  return (
    <div
      onPointerDown={(e) => tile.blocker === BlockerType.NONE && onPointerDown(e, tile)}
      className={`
        relative w-full pt-[100%] rounded-lg cursor-grab select-none touch-none
        ${isMatched ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
        ${isSelected ? 'z-30 cursor-grabbing' : isNeighbor ? 'z-20' : 'z-10'}
        ${tile.blocker !== BlockerType.NONE ? 'cursor-not-allowed grayscale-[0.5]' : ''}
      `}
      style={{
        transform: `
          translate(${offset.x}px, ${offset.y}px) 
          ${isSelected ? 'scale(1.15)' : 'scale(1)'}
          translateY(${isEntering ? '-500%' : '0%'})
        `,
        transition: isDragging 
          ? 'none' 
          : `transform 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 250ms ease`,
        transitionDelay: `${fallDelay}ms`
      }}
    >
      <div className={`absolute inset-1 rounded-full shadow-lg ${isColorBomb ? 'bg-amber-100 border-4 border-amber-300' : COLOR_MAP[tile.color]} overflow-hidden`}>
        {/* Gloss for normal candies */}
        {!isColorBomb && <div className="absolute top-1 left-1 w-1/2 h-1/3 bg-white/30 rounded-full blur-[1px]"></div>}
        
        {/* Sugar Cookie Decoration */}
        {isColorBomb ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="grid grid-cols-2 gap-0.5 opacity-80">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-amber-800/20 text-[8px] font-black uppercase tracking-tighter">LOVE</div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 select-none pointer-events-none">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
             </svg>
          </div>
        )}

        {getSpecialIcon()}
      </div>
      {getBlockerOverlay()}
    </div>
  );
};

export default TileComponent;
