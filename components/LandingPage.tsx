
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[300] bg-[#090811] text-white overflow-hidden">
      {/* Soft romantic glow */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(255,120,200,0.22),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(255,0,120,0.18),transparent_55%),radial-gradient(900px_circle_at_50%_85%,rgba(120,180,255,0.18),transparent_60%)]" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl bg-rose-400/30 animate-aurora" />
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl bg-fuchsia-500/25 animate-aurora-delayed" />
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
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
        .neo-font { font-family: 'Orbitron', sans-serif; letter-spacing: 0.06em; }
        .glow-text { text-shadow: 0 0 18px rgba(255,120,200,0.6), 0 0 40px rgba(255,0,120,0.45); }
        .hud-border { border-image: linear-gradient(135deg, rgba(255,120,200,0.9), rgba(255,0,120,0.8)) 1; }
        .glow-sweep {
          background: linear-gradient(120deg, rgba(255,255,255,0.35), rgba(255,180,220,1), rgba(255,255,255,0.35));
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: glow-sweep 2.2s ease-in-out infinite;
        }
        @keyframes glow-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
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
      `}</style>

      {/* Top HUD */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between text-xs md:text-sm">
        <div className="px-4 py-2 rounded-full border border-pink-300/40 bg-black/30 backdrop-blur-md neo-font">
          LOVE SIGNAL // ONLINE
        </div>
        <div className="px-4 py-2 rounded-full border border-pink-300/40 bg-black/30 backdrop-blur-md tracking-[0.4em]">
          v1.0
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl w-full">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] md:text-xs uppercase tracking-[0.35em]">
            <span className="w-2 h-2 rounded-full bg-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
            Heartbeat Connection
          </div>

          <h1 className="mt-6 text-5xl md:text-7xl font-black neo-font glow-text">
            LOVE QUEST
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-white/80">
            A neon love story where every match sparks destiny.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-white/70">
            <div className="px-4 py-2 rounded-full border border-white/10 bg-black/30">
              Match-3 Tactics
            </div>
            <div className="px-4 py-2 rounded-full border border-white/10 bg-black/30">
              Cinematic Story
            </div>
            <div className="px-4 py-2 rounded-full border border-white/10 bg-black/30">
              Voice Praise FX
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full blur-lg opacity-70 bg-[conic-gradient(from_90deg,rgba(255,120,200,0.9),rgba(255,0,120,0.9),rgba(255,80,160,0.9),rgba(255,120,200,0.9))] group-hover:opacity-100 transition duration-500" />
              <button
                onClick={onStart}
                className="relative px-10 md:px-14 py-4 md:py-5 rounded-full text-base md:text-lg font-bold uppercase tracking-[0.3em] neo-font hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span className="glow-sweep">Start Mission</span>
              </button>
            </div>
            <div className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-white/50">
              Tap to initiate sequence
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status strip */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-[0_0_10px_rgba(244,114,182,0.9)]" />
          Love Engine Synced
        </div>
        <div>Sector: Rose‑9</div>
      </div>
    </div>
  );
};

export default LandingPage;
