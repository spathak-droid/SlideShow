import React, { useMemo, useRef, useState } from 'react';

interface ReadyPromptProps {
  onYes: () => void;
}

const ReadyPrompt: React.FC<ReadyPromptProps> = ({ onYes }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [noClicks, setNoClicks] = useState(0);
  const [showDog, setShowDog] = useState(false);

  const hearts = useMemo(() => [...Array(10)].map((_, i) => i), []);

  const moveNoButton = () => {
    const bounds = containerRef.current?.getBoundingClientRect();
    const maxX = bounds ? Math.min(160, bounds.width * 0.25) : 140;
    const maxY = bounds ? Math.min(120, bounds.height * 0.2) : 100;
    const x = (Math.random() * 2 - 1) * maxX;
    const y = (Math.random() * 2 - 1) * maxY;
    setNoOffset({ x, y });
  };

  const handleNoClick = () => {
    if (showDog) return;
    setNoClicks(prev => {
      const next = prev + 1;
      if (next >= 2) {
        setShowDog(true);
        setTimeout(() => {
          setShowDog(false);
        }, 2000);
        return 0;
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[360] bg-[#090811] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(255,120,200,0.22),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(255,0,120,0.18),transparent_55%),radial-gradient(900px_circle_at_50%_85%,rgba(120,180,255,0.18),transparent_60%)]" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl bg-rose-400/30 animate-aurora" />
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl bg-fuchsia-500/25 animate-aurora-delayed" />
      <div className="absolute inset-0 pointer-events-none">
        {hearts.map((i) => (
          <span
            key={i}
            className="absolute text-pink-200/40 animate-float-heart"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
              fontSize: `${10 + (i % 4) * 6}px`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${10 + (i % 5) * 3}s`
            }}
          >
            ♥
          </span>
        ))}
      </div>
      <style>{`
        @keyframes aurora {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -30px, 0) scale(1.06); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .animate-aurora { animation: aurora 10s ease-in-out infinite; }
        .animate-aurora-delayed { animation: aurora 12s ease-in-out infinite; animation-delay: 1.5s; }
        @keyframes float-heart {
          0% { transform: translateY(0) scale(0.9); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1.05); opacity: 0; }
        }
        .animate-float-heart {
          animation-name: float-heart;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .neo-font { font-family: 'Orbitron', sans-serif; letter-spacing: 0.06em; }
        .glow-text { text-shadow: 0 0 18px rgba(255,120,200,0.6), 0 0 40px rgba(255,0,120,0.45); }
        @keyframes word-glow {
          0% { opacity: 0; transform: translateY(8px); letter-spacing: 0.2em; }
          60% { opacity: 1; transform: translateY(0); letter-spacing: 0.06em; }
          100% { opacity: 1; transform: translateY(0); }
        }
        .word-anim { animation: word-glow 1.2s ease-out forwards; }
      `}</style>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/60 mb-4">
          Chapter 2 Completed
        </div>
        <div className="text-3xl md:text-5xl font-black neo-font glow-text word-anim">
          Are you ready to save your beloved husband?
        </div>

        <div className="mt-10 flex items-center gap-6">
          <button
            onClick={onYes}
            className="px-10 md:px-12 py-3 md:py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-base md:text-lg font-bold uppercase tracking-[0.2em] hover:scale-[1.04] active:scale-[0.98] transition-all"
          >
            Yes
          </button>
          <button
            onMouseEnter={moveNoButton}
            onPointerEnter={moveNoButton}
            onPointerDown={handleNoClick}
            className="px-10 md:px-12 py-3 md:py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-base md:text-lg font-bold uppercase tracking-[0.2em] transition-transform"
            style={{ transform: `translate(${noOffset.x}px, ${noOffset.y}px)` }}
          >
            No
          </button>
        </div>
      </div>
      {showDog && (
        <div className="absolute inset-0 z-[380] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-4 shadow-[0_0_40px_rgba(255,120,200,0.25)]">
            <img src="doggg.JPG" alt="dog" className="max-w-[80vw] max-h-[70vh] rounded-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadyPrompt;
