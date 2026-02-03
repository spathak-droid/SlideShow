
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Tile, CandyColor, SpecialType, BlockerType } from './types';
import { GRID_ROWS, GRID_COLS, LEVELS, CANDY_COLORS } from './constants';
import { initializeGrid, checkMatches, createTile, MatchGroup, getEffectRange } from './utils/gameLogic';
import TileComponent from './components/TileComponent';
import CinematicOverlay from './components/CinematicOverlay';
import PraiseOverlay from './components/PraiseOverlay';
import LandingPage from './components/LandingPage';
import VideoIntro from './components/VideoIntro';
import ReadyPrompt from './components/ReadyPrompt';
import StorySlides from './components/StorySlides';
import ImagePuzzle from './components/ImagePuzzle';
import EndingVideo from './components/EndingVideo';
import EndingMontage from './components/EndingMontage';
import EndingMessage from './components/EndingMessage';
import { ensureAudioReady, playBell, preloadPraiseClips, speakPraise, stopPraiseAudio } from './utils/audioUtils';

const PRAISE_WORDS = {
  tier1: ["Tasty!", "Sweet!"],
  tier2: ["Delicious!", "Divine!"],
  tier3: ["Sweet!", "Tasty!", "Delicious!", "Divine!"]
};

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    moves: LEVELS[1].moves,
    score: 0,
    targetScore: LEVELS[1].targetScore,
    objectives: { ice: LEVELS[1].iceCount },
    grid: [],
    status: 'landing',
    chainsRemaining: 2
  });

  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentPraise, setCurrentPraise] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingPraiseRef = useRef<string | null>(null);
  const [hasPreloadedPraise, setHasPreloadedPraise] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    tile: Tile;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    neighbor: Tile | null;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tileWidthRef = useRef<number>(0);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // gravity
          life: p.life - 0.02
        }))
        .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  useEffect(() => {
    if (hasPreloadedPraise) return;
    if (gameState.status === 'landing') return;
    setHasPreloadedPraise(true);
    preloadPraiseClips(["Tasty!", "Sweet!"]);
  }, [gameState.status, hasPreloadedPraise]);

  const spawnParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles].slice(-50));
  };

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.grid.length === 0) {
      const config = LEVELS[gameState.level];
      setGameState(prev => ({
        ...prev,
        moves: config.moves,
        grid: initializeGrid(config.rows, config.cols, config.iceCount, config.lockCount)
      }));
    }
  }, [gameState.status, gameState.level, gameState.grid.length]);

  useEffect(() => {
    if (containerRef.current) {
      tileWidthRef.current = containerRef.current.clientWidth / 8;
    }
  }, [gameState.grid, gameState.status]);

  useEffect(() => {
    if (!bgAudioRef.current) {
      const audio = new Audio('sounds/MainScreen.mp3');
      audio.loop = true;
      audio.volume = 0.6;
      bgAudioRef.current = audio;
    }

    const audio = bgAudioRef.current;
    if (!audio) return;

    if (gameState.status === 'playing' && gameState.level === 1) {
      audio.play().catch(() => {
        // Autoplay may be blocked until a user gesture.
      });
    } else {
      audio.pause();
    }
  }, [gameState.status]);

  const handlePointerDown = (e: React.PointerEvent, tile: Tile) => {
    ensureAudioReady();
    if (isProcessing || gameState.status !== 'playing') return;
    setDragInfo({
      tile,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      neighbor: null
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo || isProcessing) return;
    const dx = e.clientX - dragInfo.startX;
    const dy = e.clientY - dragInfo.startY;
    const size = tileWidthRef.current;
    let neighbor: Tile | null = null;
    let clampedDx = 0, clampedDy = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      clampedDx = Math.max(-size, Math.min(size, dx));
      const colOffset = clampedDx > 0 ? 1 : -1;
      const targetCol = dragInfo.tile.y + colOffset;
      if (targetCol >= 0 && targetCol < GRID_COLS) neighbor = gameState.grid[dragInfo.tile.x][targetCol];
    } else {
      clampedDy = Math.max(-size, Math.min(size, dy));
      const rowOffset = clampedDy > 0 ? 1 : -1;
      const targetRow = dragInfo.tile.x + rowOffset;
      if (targetRow >= 0 && targetRow < GRID_ROWS) neighbor = gameState.grid[targetRow][dragInfo.tile.y];
    }
    if (neighbor?.blocker !== BlockerType.NONE) neighbor = null;
    setDragInfo({ ...dragInfo, currentX: dragInfo.startX + clampedDx, currentY: dragInfo.startY + clampedDy, neighbor });
  };

  const handlePointerUp = async () => {
    if (!dragInfo || isProcessing) return;
    const dx = dragInfo.currentX - dragInfo.startX;
    const dy = dragInfo.currentY - dragInfo.startY;
    const threshold = tileWidthRef.current * 0.45;

    if (dragInfo.neighbor && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
      const t1 = dragInfo.tile;
      const t2 = dragInfo.neighbor;
      setDragInfo(null);
      await swapTiles(t1, t2);
    } else {
      setDragInfo(null);
    }
  };

  const triggerPraise = (tier: 1 | 2 | 3, deferVoice: boolean) => {
    if (gameState.level !== 1) return;
    const list = tier === 3 ? PRAISE_WORDS.tier3 : tier === 2 ? PRAISE_WORDS.tier2 : PRAISE_WORDS.tier1;
    const word = list[Math.floor(Math.random() * list.length)];
    setCurrentPraise(word);
    if (deferVoice) {
      pendingPraiseRef.current = word;
      playBell();
    } else {
      speakPraise(word);
    }
  };

  const swapTiles = async (t1: Tile, t2: Tile) => {
    setIsProcessing(true);
    const newGrid = [...gameState.grid.map(row => [...row])];
    const t1X = t1.x, t1Y = t1.y, t2X = t2.x, t2Y = t2.y;

    if (t1.special === SpecialType.COLOR_BOMB || t2.special === SpecialType.COLOR_BOMB) {
      const colorToClear = t1.special === SpecialType.COLOR_BOMB ? t2.color : t1.color;
      const bombX = t1.special === SpecialType.COLOR_BOMB ? t1X : t2X;
      const bombY = t1.special === SpecialType.COLOR_BOMB ? t1Y : t2Y;
      
      newGrid[bombX][bombY].isMatched = true;
      newGrid.forEach(row => row.forEach(tile => {
        if (tile.color === colorToClear) tile.isMatched = true;
      }));
      
      setGameState(prev => ({ ...prev, moves: prev.moves - 1, grid: newGrid }));
      triggerPraise(2);
      await new Promise(resolve => setTimeout(resolve, 350));
      await processMatches(newGrid, true, undefined, 1);
      return;
    }

    const blocker1 = t1.blocker;
    const blocker2 = t2.blocker;
    newGrid[t1X][t1Y] = { ...t2, x: t1X, y: t1Y, blocker: blocker1 };
    newGrid[t2X][t2Y] = { ...t1, x: t2X, y: t2Y, blocker: blocker2 };
    setGameState(prev => ({ ...prev, grid: newGrid }));
    await new Promise(resolve => setTimeout(resolve, 300));

    const groups = checkMatches(newGrid);
    if (groups.length > 0) {
      setGameState(prev => ({ ...prev, moves: prev.moves - 1 }));
      await processMatches(newGrid, false, { r: t2X, c: t2Y }, 1);
    } else {
      const undoGrid = [...newGrid.map(row => [...row])];
      undoGrid[t1X][t1Y] = { ...newGrid[t2X][t2Y], x: t1X, y: t1Y };
      undoGrid[t2X][t2Y] = { ...newGrid[t1X][t1Y], x: t2X, y: t2Y };
      setGameState(prev => ({ ...prev, grid: undoGrid }));
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsProcessing(false);
    }
  };

  const processMatches = useCallback(async (currentGrid: Tile[][], skipCheck = false, lastMovePivot?: { r: number, c: number }, cascadeCount: number = 0) => {
    const groups = skipCheck ? [] : checkMatches(currentGrid);
    if (groups.length === 0 && !skipCheck) {
      if (pendingPraiseRef.current) {
        const word = pendingPraiseRef.current;
        pendingPraiseRef.current = null;
        speakPraise(word);
      }
      setIsProcessing(false);
      checkGameStatus();
      return;
    }

    const matchedCoords = new Set<string>();
    const specialToCreate: { r: number, c: number, type: SpecialType, color: CandyColor }[] = [];

    let hasSpecialTrigger = false;
    groups.forEach(group => {
      group.tiles.forEach(t => {
        matchedCoords.add(`${t.r},${t.c}`);
        // Spawn particles for each match
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const pX = rect.left + t.c * tileWidthRef.current + tileWidthRef.current / 2;
          const pY = rect.top + 80 + t.r * tileWidthRef.current + tileWidthRef.current / 2;
          spawnParticles(pX, pY);
        }
      });
      if (group.type !== SpecialType.NONE) {
        const pivot = lastMovePivot && group.tiles.some(t => t.r === lastMovePivot.r && t.c === lastMovePivot.c) 
          ? lastMovePivot 
          : group.pivot || group.tiles[0];
        specialToCreate.push({ ...pivot, type: group.type, color: group.color });
        hasSpecialTrigger = true;
      }
    });

    const extraMatches = new Set<string>();
    matchedCoords.forEach(coord => {
      const [r, c] = coord.split(',').map(Number);
      const tile = currentGrid[r][c];
      if (tile.special !== SpecialType.NONE && !tile.isMatched) {
        getEffectRange(tile, currentGrid).forEach(range => {
          extraMatches.add(`${range.r},${range.c}`);
          hasSpecialTrigger = true;
        });
      }
    });
    extraMatches.forEach(c => matchedCoords.add(c));

    const deferVoice = cascadeCount > 1;
    if (cascadeCount > 3 || matchedCoords.size > 8) triggerPraise(3, deferVoice);
    else if (hasSpecialTrigger || cascadeCount === 2) triggerPraise(2, deferVoice);
    else if (cascadeCount === 1) triggerPraise(1, deferVoice);

    let iceCleared = 0;
    const updatedGrid = currentGrid.map((row, r) => row.map((tile, c) => {
      const isMatched = matchedCoords.has(`${r},${c}`) || tile.isMatched;
      if (isMatched) {
        [-1, 0, 1].forEach(dx => [-1, 0, 1].forEach(dy => {
          const nx = r + dx, ny = c + dy;
          if (nx >= 0 && nx < GRID_ROWS && ny >= 0 && ny < GRID_COLS && currentGrid[nx][ny].blocker === BlockerType.ICE) {
            currentGrid[nx][ny].blocker = BlockerType.NONE;
            iceCleared++;
          }
        }));
        return { ...tile, isMatched: true };
      }
      return tile;
    }));

    setGameState(prev => ({
      ...prev,
      score: prev.score + matchedCoords.size * 100,
      objectives: { ...prev.objectives, ice: Math.max(0, (prev.objectives.ice || 0) - iceCleared) },
      grid: updatedGrid
    }));

    await new Promise(resolve => setTimeout(resolve, 350));

    const rows = updatedGrid.length, cols = updatedGrid[0].length;
    const refilledGrid = updatedGrid.map(row => row.map(tile => ({ ...tile, isNew: false })));
    
    for (let c = 0; c < cols; c++) {
      let emptySlots = 0;
      for (let r = rows - 1; r >= 0; r--) {
        if (refilledGrid[r][c].isMatched) {
          emptySlots++;
        } else if (emptySlots > 0) {
          refilledGrid[r + emptySlots][c] = { ...refilledGrid[r][c], x: r + emptySlots };
          refilledGrid[r][c] = { ...createTile(r, c), isMatched: true, isNew: false };
        }
      }
      for (let r = 0; r < emptySlots; r++) {
        refilledGrid[r][c] = { ...createTile(r, c), isNew: true };
      }
    }

    specialToCreate.forEach(s => {
      refilledGrid[s.r][s.c] = { ...createTile(s.r, s.c, s.color), special: s.type, isNew: true };
    });

    setGameState(prev => ({ ...prev, grid: refilledGrid }));
    await new Promise(resolve => setTimeout(resolve, 600));
    await processMatches(refilledGrid, false, undefined, cascadeCount + 1);
  }, []);

  const checkGameStatus = () => {
    setGameState(prev => {
      const isComplete = prev.score >= prev.targetScore && (prev.objectives.ice || 0) <= 0;
      if (isComplete) return { ...prev, status: prev.level === 1 ? 'cinematic' : 'ending', chainsRemaining: prev.level === 1 ? 1 : 0 };
      if (prev.moves <= 0) return { ...prev, status: 'gameover' };
      return prev;
    });
  };

  const isGameActive = gameState.status === 'playing';
  const isTrialOne = gameState.level === 1;
  const isTrialTwo = gameState.level === 2;

  const goToTrialTwo = () => {
    pendingPraiseRef.current = null;
    stopPraiseAudio();
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    setGameState(p => ({ 
      ...p, 
      level: 2, 
      status: 'playing', 
      grid: [], 
      moves: LEVELS[2].moves, 
      score: 0, 
      targetScore: LEVELS[2].targetScore, 
      objectives: { ice: LEVELS[2].iceCount } 
    }));
  };

  const handleStartGame = () => {
    ensureAudioReady();
    setGameState(p => ({ ...p, status: 'video' }));
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center bg-indigo-950 overflow-x-hidden overflow-y-auto select-none touch-none transition-colors duration-1000 relative`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {isGameActive && isTrialOne && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(255,120,200,0.18),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(255,0,120,0.16),transparent_55%),radial-gradient(900px_circle_at_50%_85%,rgba(120,180,255,0.14),transparent_60%)]" />
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl bg-rose-400/20" />
          <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl bg-fuchsia-500/20" />
        </div>
      )}

      {/* Particles Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60]">
        {particles.map(p => (
          <div 
            key={p.id} 
            className="absolute text-xl"
            style={{ 
              left: p.x, 
              top: p.y, 
              opacity: p.life,
              transform: `scale(${p.life}) rotate(${p.life * 360}deg)`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {gameState.status === 'landing' && (
        <LandingPage onStart={handleStartGame} />
      )}

      {gameState.status === 'video' && (
        <VideoIntro
          autoplayWithSound
          onComplete={() => setGameState(p => ({ ...p, status: 'intro' }))}
        />
      )}

      {gameState.status === 'intro' && (
        <ReadyPrompt onYes={() => setGameState(p => ({ ...p, status: 'story' }))} />
      )}

      {gameState.status === 'story' && (
        <StorySlides onComplete={() => setGameState(p => ({ ...p, status: 'playing' }))} />
      )}

      {gameState.status === 'endingVideo' && (
        <EndingVideo
          autoplayWithSound
          onComplete={() => setGameState(p => ({ ...p, status: 'montage' }))}
        />
      )}

      {gameState.status === 'montage' && (
        <EndingMontage onComplete={() => setGameState(p => ({ ...p, status: 'ending' }))} />
      )}

      {currentPraise && <PraiseOverlay text={currentPraise} onFinished={() => setCurrentPraise(null)} />}
      
      {gameState.status === 'cinematic' && (
        <CinematicOverlay type="chain1" onNext={goToTrialTwo} />
      )}

      {gameState.status === 'ending' && null}
      {gameState.status === 'ending' && (
        <EndingMessage />
      )}

      {isGameActive && (
        <>
          <div className="w-full max-w-3xl px-4 py-4 sticky top-0 z-50">
            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 shadow-[0_0_25px_rgba(255,120,200,0.18)]">
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">Trial {gameState.level}</div>
                <div className="mt-1 text-base md:text-lg font-black text-white">
                  Moves
                  <span className={`ml-2 text-2xl md:text-3xl tabular-nums ${gameState.moves < 5 ? 'text-rose-300 animate-pulse' : 'text-white'}`}>{gameState.moves}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md px-4 py-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/50">Chains</div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <div className={`text-2xl transition-opacity duration-500 ${gameState.chainsRemaining < 1 ? 'opacity-20' : ''}`}>⛓️</div>
                  <div className="text-3xl animate-float">🤵</div>
                  <div className={`text-2xl transition-opacity duration-500 ${gameState.chainsRemaining < 2 ? 'opacity-20' : ''}`}>⛓️</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-right shadow-[0_0_25px_rgba(120,180,255,0.18)]">
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">Score</div>
                <div className="mt-1 text-lg md:text-xl font-black text-white tabular-nums">
                  {gameState.score} / {gameState.targetScore}
                </div>
              </div>
            </div>
            {isTrialOne && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={goToTrialTwo}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs uppercase tracking-[0.3em] text-white/80 hover:bg-white/20 transition-all"
                >
                  Skip to Trial 2
                </button>
              </div>
            )}
          </div>

          {isTrialTwo ? (
            <ImagePuzzle onComplete={() => setGameState(p => ({ ...p, status: 'endingVideo' }))} />
          ) : (
            <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mt-6 px-4 pb-12" ref={containerRef}>
            <div className="rounded-2xl p-4 mb-6 shadow-xl flex justify-around border border-white/20 bg-white/10 backdrop-blur-md">
               <div className="flex flex-col items-center">
                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 shadow-inner">❄️</div>
                 <span className="text-xs font-bold mt-1 text-white/70">Ice: {gameState.objectives.ice || 0}</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 shadow-inner">💖</div>
                 <span className="text-xs font-bold mt-1 text-white/70">Heroic Love</span>
               </div>
            </div>

            <div className={`grid grid-cols-8 gap-1 p-2 rounded-2xl shadow-2xl border-4 relative overflow-hidden bg-white/20 backdrop-blur-sm ${gameState.level === 1 ? 'border-pink-200 shadow-pink-200/50' : 'border-indigo-400 shadow-indigo-900/50'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none z-0" />
              {gameState.grid.map((row) => row.map((tile) => {
                const isSelected = dragInfo?.tile.id === tile.id;
                const isNeighbor = dragInfo?.neighbor?.id === tile.id;
                let offsetX = 0, offsetY = 0;
                if (isSelected && dragInfo) { offsetX = dragInfo.currentX - dragInfo.startX; offsetY = dragInfo.currentY - dragInfo.startY; }
                else if (isNeighbor && dragInfo) { offsetX = -(dragInfo.currentX - dragInfo.startX); offsetY = -(dragInfo.currentY - dragInfo.startY); }
                return (
                  <TileComponent
                    key={tile.id}
                    tile={tile}
                    onPointerDown={handlePointerDown}
                    isSelected={isSelected}
                    isNeighbor={isNeighbor}
                    offset={{ x: offsetX, y: offsetY }}
                    isMatched={tile.isMatched}
                  />
                );
              }))}
            </div>
            </div>
          )}
        </>
      )}

      {gameState.status === 'gameover' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="text-7xl mb-4">💔</div>
             <h2 className="text-4xl fancy-font text-pink-600">Out of Moves!</h2>
             <p className="mt-4 text-slate-500">The monster's magic was too strong... for now.</p>
             <button onClick={() => window.location.reload()} className="mt-8 px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform">RETRY QUEST</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
