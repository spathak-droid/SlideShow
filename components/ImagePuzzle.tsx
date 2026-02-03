import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ImagePuzzleProps {
  onComplete: () => void;
}

const GRID = 3;
const IMAGE_SRC = 'IMG_3471.JPG';
const MUSIC_SRC = 'sounds/romantic.mp3';

type Edge = -1 | 0 | 1;
type Piece = {
  id: number;
  r: number;
  c: number;
  x: number;
  y: number;
  placed: boolean;
  z: number;
};

const ImagePuzzle: React.FC<ImagePuzzleProps> = ({ onComplete }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(320);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [stageRect, setStageRect] = useState({ left: 0, top: 0 });

  const tabDepth = boardSize / GRID * 0.2;
  const pieceSize = boardSize / GRID;
  const trayTop = boardSize + 24;
  const trayHeight = Math.max(pieceSize * 1.7, 160);

  const edges = useMemo(() => {
    const horizontal: Edge[][] = Array.from({ length: GRID }, () => Array(GRID - 1).fill(0));
    const vertical: Edge[][] = Array.from({ length: GRID - 1 }, () => Array(GRID).fill(0));
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID - 1; c++) {
        horizontal[r][c] = Math.random() > 0.5 ? 1 : -1;
      }
    }
    for (let r = 0; r < GRID - 1; r++) {
      for (let c = 0; c < GRID; c++) {
        vertical[r][c] = Math.random() > 0.5 ? 1 : -1;
      }
    }
    return { horizontal, vertical };
  }, []);
  const confetti = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);

  useEffect(() => {
    const measure = () => {
      const width = wrapRef.current?.clientWidth ?? 320;
      const size = Math.min(width, 560);
      setBoardSize(size);
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect) setStageRect({ left: rect.left, top: rect.top });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Autoplay may be blocked until a user gesture.
    });
    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) setStageRect({ left: rect.left, top: rect.top });
  }, [boardSize]);

  useEffect(() => {
    const next: Piece[] = [];
    let z = 1;
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = Math.random() * (boardSize - pieceSize);
        const y = trayTop + Math.random() * (trayHeight - pieceSize);
        next.push({
          id: r * GRID + c,
          r,
          c,
          x,
          y,
          placed: false,
          z: z++,
        });
      }
    }
    setPieces(next);
  }, [boardSize]);

  useEffect(() => {
    if (pieces.length === 0) return;
    const done = pieces.every(p => p.placed);
    if (done) {
      setIsSolved(true);
    }
  }, [pieces]);

  const getPieceEdges = (r: number, c: number) => {
    const top: Edge = r === 0 ? 0 : (edges.vertical[r - 1][c] * -1 as Edge);
    const bottom: Edge = r === GRID - 1 ? 0 : edges.vertical[r][c];
    const left: Edge = c === 0 ? 0 : (edges.horizontal[r][c - 1] * -1 as Edge);
    const right: Edge = c === GRID - 1 ? 0 : edges.horizontal[r][c];
    return { top, right, bottom, left };
  };

  const getPath = (top: Edge, right: Edge, bottom: Edge, left: Edge) => {
    const s = pieceSize;
    const d = tabDepth;
    const notch = s * 0.25;
    const curve = s * 0.5;
    const topOffset = top * -d;
    const rightOffset = right * d;
    const bottomOffset = bottom * d;
    const leftOffset = left * -d;

    return [
      `M 0 0`,
      `L ${notch} 0`,
      top === 0 ? `L ${s} 0` : `Q ${curve} ${topOffset} ${s - notch} 0 L ${s} 0`,
      `L ${s} ${notch}`,
      right === 0 ? `L ${s} ${s}` : `Q ${s + rightOffset} ${curve} ${s} ${s - notch} L ${s} ${s}`,
      `L ${s - notch} ${s}`,
      bottom === 0 ? `L 0 ${s}` : `Q ${curve} ${s + bottomOffset} ${notch} ${s} L 0 ${s}`,
      `L 0 ${s - notch}`,
      left === 0 ? `L 0 0` : `Q ${leftOffset} ${curve} 0 ${notch} L 0 0`,
      `Z`
    ].join(' ');
  };

  const bringToFront = (id: number) => {
    setPieces(prev => {
      const maxZ = Math.max(...prev.map(p => p.z));
      return prev.map(p => p.id === id ? { ...p, z: maxZ + 1 } : p);
    });
  };

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece || piece.placed) return;
    bringToFront(id);
    setDragId(id);
    setDragOffset({
      x: (e.clientX - stageRect.left) - piece.x,
      y: (e.clientY - stageRect.top) - piece.y
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (dragId === null) return;
    setPieces(prev => prev.map(p => {
      if (p.id !== dragId) return p;
      return { 
        ...p, 
        x: (e.clientX - stageRect.left) - dragOffset.x, 
        y: (e.clientY - stageRect.top) - dragOffset.y 
      };
    }));
  };

  const handlePointerUp = () => {
    if (dragId === null) return;
    setPieces(prev => prev.map(p => {
      if (p.id !== dragId) return p;
      const targetX = p.c * pieceSize;
      const targetY = p.r * pieceSize;
      const dx = p.x - targetX;
      const dy = p.y - targetY;
      const close = Math.hypot(dx, dy) < pieceSize * 0.2;
      return close ? { ...p, x: targetX, y: targetY, placed: true } : p;
    }));
    setDragId(null);
  };

  useEffect(() => {
    if (dragId === null) return;
    const move = (e: PointerEvent) => handlePointerMove(e);
    const up = () => handlePointerUp();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragId, dragOffset.x, dragOffset.y]);

  return (
    <>
    <div ref={wrapRef} className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mt-6 px-4 pb-12">
      <div className="rounded-2xl p-4 md:p-5 mb-4 border border-white/20 bg-white/10 backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.35em] text-white/60">Trial 2</div>
        <div className="mt-2 text-xl md:text-2xl font-black text-white">
          Love Memory Puzzle
        </div>
        <div className="text-sm md:text-base text-white/70 mt-1">
          Drag pieces from the tray onto the board.
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs uppercase tracking-[0.3em] text-white/80 hover:bg-white/20 transition-all"
          >
            Skip Trial 2
          </button>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: boardSize }}>
        <div
          className="relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(255,120,200,0.2)] overflow-hidden"
          style={{ width: boardSize, height: boardSize }}
        >
          <div className="absolute inset-0 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent)]" />
          <svg
            className="absolute inset-0"
            width={boardSize}
            height={boardSize}
            viewBox={`0 0 ${boardSize} ${boardSize}`}
          >
            {Array.from({ length: GRID * GRID }, (_, i) => {
              const r = Math.floor(i / GRID);
              const c = i % GRID;
              const { top, right, bottom, left } = getPieceEdges(r, c);
              const path = getPath(top, right, bottom, left);
              return (
                <g key={i} transform={`translate(${c * pieceSize}, ${r * pieceSize})`}>
                  <path
                    d={path}
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div
          className="relative mt-6 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md"
          style={{ height: trayHeight }}
        >
          <div className="absolute left-6 top-4 text-[11px] uppercase tracking-[0.35em] text-white/50">
            Tray
          </div>
        </div>

        <div
          ref={stageRef}
          className="absolute top-0 left-0"
          style={{ width: boardSize, height: boardSize + trayHeight + 24 }}
        >
      {pieces.map(piece => {
            const { top, right, bottom, left } = getPieceEdges(piece.r, piece.c);
            const path = getPath(top, right, bottom, left);
            const svgSize = pieceSize + tabDepth * 2;
            const offsetX = piece.x - tabDepth;
            const offsetY = piece.y - tabDepth;
            return (
              <div
                key={piece.id}
                className="absolute touch-none"
                style={{
                  left: offsetX,
                  top: offsetY,
                  width: svgSize,
                  height: svgSize,
                  zIndex: piece.z,
                  cursor: piece.placed ? 'default' : 'grab',
                }}
                onPointerDown={(e) => handlePointerDown(e, piece.id)}
              >
                <svg
                  width={svgSize}
                  height={svgSize}
                  viewBox={`${-tabDepth} ${-tabDepth} ${pieceSize + tabDepth * 2} ${pieceSize + tabDepth * 2}`}
                >
                  <defs>
                    <clipPath id={`clip-${piece.id}`}>
                      <path d={path} />
                    </clipPath>
                  </defs>
                  <image
                    href={IMAGE_SRC}
                    width={boardSize}
                    height={boardSize}
                    x={-piece.c * pieceSize}
                    y={-piece.r * pieceSize}
                    clipPath={`url(#clip-${piece.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path d={path} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {isSolved && (
      <div className="fixed inset-0 z-[420] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
            }
            .confetti-piece {
              position: absolute;
              width: 10px;
              height: 16px;
              border-radius: 3px;
              animation: confetti-fall linear infinite;
            }
          `}</style>
          <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_20%,rgba(255,120,200,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_10%,rgba(255,0,120,0.16),transparent_55%),radial-gradient(700px_circle_at_50%_80%,rgba(120,180,255,0.14),transparent_60%)]" />
          {confetti.map((i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}vh`,
                background: i % 4 === 0 ? '#ff79c6' : i % 4 === 1 ? '#ffd166' : i % 4 === 2 ? '#8be9fd' : '#b388ff',
                animationDuration: `${6 + (i % 5)}s`,
                animationDelay: `${(i % 7) * 0.4}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 w-[88%] max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md px-8 py-10 text-center shadow-[0_0_40px_rgba(255,120,200,0.25)]">
          <div className="text-xs uppercase tracking-[0.35em] text-white/60">Complete</div>
          <div className="mt-3 text-2xl md:text-3xl font-black text-white">Memory Restored</div>
          <div className="mt-2 text-white/70">Your love shines through.</div>
          <button
            onClick={onComplete}
            className="mt-8 px-10 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold shadow-[0_0_20px_rgba(255,120,200,0.5)] transition-all"
          >
            Next
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default ImagePuzzle;
