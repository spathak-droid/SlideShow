import React, { useEffect, useMemo, useRef, useState } from 'react';

interface StorySlidesProps {
  onComplete: () => void;
}

const StorySlides: React.FC<StorySlidesProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  const hearts = useMemo(() => [...Array(10)].map((_, i) => i), []);

  const goNext = () => {
    if (page === 0) {
      setPage(1);
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStart(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStart === null) return;
    const dx = e.clientX - dragStart;
    setDragStart(null);
    if (dx < -50) goNext();
  };

  useEffect(() => {
    if (!bgAudioRef.current) {
      const audio = new Audio('sounds/Candy Crush Menu.mp3');
      audio.loop = true;
      audio.volume = 0.6;
      bgAudioRef.current = audio;
    }
    const audio = bgAudioRef.current;
    if (!audio) return;
    audio.play().catch(() => {
      // Autoplay may be blocked until a user gesture.
    });
    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[360] bg-[#090811] text-white overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setDragStart(null)}
    >
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
        @keyframes slide-hint {
          0% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(6px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.6; }
        }
        .slide-hint { animation: slide-hint 1.6s ease-in-out infinite; }
        @keyframes progress-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .progress-fill {
          transform-origin: left;
          animation: progress-fill 2s linear forwards;
        }
      `}</style>

      <div className="relative z-10 h-full w-full overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          <div className="w-full flex-shrink-0 flex items-center justify-center px-8 text-center">
            <div className="max-w-3xl">
              <div className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/60 mb-4">
                Page 1
              </div>
              <div className="text-3xl md:text-5xl font-black neo-font glow-text">
                Very well, Anita… your journey begins now!
              </div>
              <p className="mt-6 text-lg md:text-2xl text-white/80">
                The first challenge awaits: a Candy Quest.
              </p>
            </div>
          </div>
          <div className="w-full flex-shrink-0 flex items-center justify-center px-8 text-center">
            <div className="max-w-3xl">
              <div className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/60 mb-4">
                Page 2
              </div>
              <div className="text-2xl md:text-4xl font-black neo-font glow-text">
                Match, swap, and clear the candies to break the first chain and move closer to your prince.
              </div>
              <p className="mt-6 text-lg md:text-2xl text-white/80">
                Good luck… and may your love guide every move!
              </p>
            </div>
          </div>
        </div>

        {!isLoading && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
            <div className="text-3xl md:text-4xl slide-hint glow-text">
              →
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[380] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-[88%] max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md px-8 py-10 text-center shadow-[0_0_40px_rgba(255,120,200,0.25)]">
            <div className="flex items-center justify-center gap-4 text-4xl md:text-5xl mb-6">
              <span className="animate-bounce">🍬</span>
              <span className="animate-pulse">💖</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🍭</span>
            </div>
            <div className="text-sm uppercase tracking-[0.35em] text-white/60 mb-3">
              Loading Love
            </div>
            <div className="text-2xl md:text-3xl font-black neo-font glow-text">
              Preparing the Candy Trial
            </div>
            <div className="mt-6 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-pink-300 to-fuchsia-400 progress-fill" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorySlides;
