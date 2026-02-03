
import React, { useEffect, useMemo } from 'react';

interface CinematicOverlayProps {
  type: 'chain1' | 'victory';
  onNext: () => void;
}

const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ type, onNext }) => {
  const confetti = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);

  useEffect(() => {
    if (type !== 'chain1') return;
    const audio = new Audio('sounds/Candy Crush Win.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {
      // Autoplay may be blocked without a user gesture.
    });
    return () => {
      audio.pause();
    };
  }, [type]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
      {type === 'chain1' && (
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
      )}
      {type === 'chain1' ? (
        <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md p-8 md:p-10 shadow-[0_0_40px_rgba(255,120,200,0.25)] animate-in fade-in zoom-in duration-700">
          <div className="text-xs uppercase tracking-[0.4em] text-white/60">Trial Complete</div>
          <div className="mt-4 text-6xl md:text-7xl">💥⛓️</div>
          <h2 className="mt-4 text-3xl md:text-5xl fancy-font text-pink-300 drop-shadow-[0_0_20px_rgba(255,120,200,0.6)]">
            The First Chain Shatters!
          </h2>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            "I can feel my strength returning! Please, my love, just one more trial!"
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-4xl">
             <span className="opacity-40">⛓️</span>
             <span className="animate-pulse">🤵</span>
             <span className="text-pink-300 drop-shadow-[0_0_12px_rgba(255,120,200,0.8)]">⛓️</span>
          </div>
          <button 
            onClick={onNext}
            className="mt-8 px-10 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-full font-bold text-lg md:text-xl shadow-[0_0_20px_rgba(255,120,200,0.5)] transition-all"
          >
            CONTINUE TO LEVEL 2
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="text-9xl mb-4">🎉❤️</div>
          <h2 className="text-5xl fancy-font text-yellow-400">Quest Complete!</h2>
          <div className="relative inline-block mt-8">
            <div className="text-8xl">👩‍❤️‍👨</div>
            <div className="absolute -top-4 -right-4 text-4xl animate-ping">💖</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce">🍬</div>
          </div>
          <p className="text-2xl mt-8">"You saved me! Happy Valentine's Day, my hero!"</p>
          <div className="text-pink-300 italic text-lg mt-4">Love conquers all trials.</div>
          
          <div className="grid grid-cols-3 gap-4 mt-8 opacity-60">
            <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎆</div>
            <div className="animate-bounce" style={{ animationDelay: '0.3s' }}>🎇</div>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎆</div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="mt-12 px-10 py-3 border-2 border-white hover:bg-white hover:text-black rounded-full font-bold transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default CinematicOverlay;
