import React from 'react';

const EndingMessage: React.FC = () => {
  return (
    <div className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[360] bg-[#090811] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(255,120,200,0.22),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(255,0,120,0.18),transparent_55%),radial-gradient(900px_circle_at_50%_85%,rgba(120,180,255,0.18),transparent_60%)]" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl bg-rose-400/30 animate-aurora" />
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl bg-fuchsia-500/25 animate-aurora-delayed" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(22)].map((_, i) => {
          const sx = (i * 17) % 100;
          const sy = -10 - (i * 7) % 60;
          const tx = 47 + (i % 6); // cluster near center
          const ty = 48 + (i % 6);
          return (
            <span
              key={i}
              className="absolute text-pink-200/50 heart-rain"
              style={{
                left: `var(--sx)`,
                top: `var(--sy)`,
                fontSize: `${10 + (i % 4) * 6}px`,
                animationDelay: `${i * 0.25}s`,
                animationDuration: `${7 + (i % 5)}s`,
                ['--sx' as any]: `calc(${sx} * 1vw)`,
                ['--sy' as any]: `calc(${sy} * 1vh)`,
                ['--tx' as any]: `calc(${tx} * 1vw)`,
                ['--ty' as any]: `calc(${ty} * 1vh)`
              }}
            >
              ♥
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes aurora {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -30px, 0) scale(1.06); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .animate-aurora { animation: aurora 10s ease-in-out infinite; }
        .animate-aurora-delayed { animation: aurora 12s ease-in-out infinite; animation-delay: 1.5s; }
        @keyframes heart-rain {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate(calc(var(--tx) - var(--sx)), calc(var(--ty) - var(--sy))); opacity: 0; }
        }
        .heart-rain {
          animation-name: heart-rain;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .neo-font { font-family: 'Orbitron', sans-serif; letter-spacing: 0.06em; }
        .glow-text { text-shadow: 0 0 18px rgba(255,120,200,0.6), 0 0 40px rgba(255,0,120,0.45); }
      `}</style>

      <div className="relative z-10 min-h-[100svh] flex items-center justify-center px-8 text-center">
        <div className="max-w-3xl rounded-3xl border border-white/20 bg-black/30 backdrop-blur-md px-8 md:px-12 py-10 shadow-[0_0_40px_rgba(255,120,200,0.35)]">
          <div className="text-3xl md:text-4xl font-black neo-font glow-text">
            Anita… you’ve been my joy, my laughter, my heart for all these years.
          </div>
          <div className="mt-4 text-lg md:text-2xl text-white/85" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Thank you for every smile, every hug, every moment.
          </div>
          <div className="mt-3 text-lg md:text-2xl text-white/85" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            I love you more with each passing day.
          </div>
          <div className="mt-6 text-2xl md:text-3xl font-black glow-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Happy Valentine’s Day ❤️
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndingMessage;
