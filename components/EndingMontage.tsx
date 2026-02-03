import React, { useEffect, useMemo, useState } from 'react';

interface EndingMontageProps {
  onComplete: () => void;
}

const IMAGE_SET = [
  'images/IMG_0103.jpg',
  'images/IMG_0125.JPG',
  'images/IMG_0221.JPG',
  'images/IMG_0300.JPG',
  'images/IMG_0417.JPG',
  'images/IMG_1837.jpg',
  'images/IMG_1943.jpg',
  'images/IMG_3001.JPG',
  'images/IMG_3466.jpg',
  'images/IMG_3470.JPG',
  'images/IMG_3496.jpg',
  'images/IMG_3498.jpg',
  'images/IMG_4333.jpg',
  'images/IMG_4488.JPG',
  'images/IMG_5137.jpg',
  'images/IMG_5193.jpg',
  'images/IMG_5409.jpg',
  'images/IMG_5802.jpg',
  'images/IMG_5949.jpg',
  'images/IMG_5953.jpg',
  'images/IMG_9689.JPG',
  'images/_20171006_234237.JPEG',
];

const EndingMontage: React.FC<EndingMontageProps> = ({ onComplete }) => {
  const images = useMemo(() => IMAGE_SET, []);
  const captions = useMemo(
    () => [
      "Look how goofy we were together",
      "From our first adventures to all the silly little moments",
      "Every trip, every laugh, every little mishap we shared",
      "We’ve come so far, grown so much, and still stayed side by side",
      "Through quiet mornings and chaotic days… we made it together",
      "Look at us… all these years later, still laughing, still loving",
      "Here’s to many more years of love, laughter, and adventure. Happy Valentine’s Day ❤️",
    ],
    []
  );
  const [index, setIndex] = useState(0);
  const [showTextOnly, setShowTextOnly] = useState(true);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowTextOnly(false);
    }, 4000);
    return () => clearTimeout(textTimer);
  }, []);

  useEffect(() => {
    if (showTextOnly) return;
    const tick = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 1000);
    const done = setTimeout(() => {
      onComplete();
    }, images.length * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [showTextOnly, images.length, onComplete]);

  return (
    <div className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[360] bg-[#090811] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(255,120,200,0.22),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(255,0,120,0.18),transparent_55%),radial-gradient(900px_circle_at_50%_85%,rgba(120,180,255,0.18),transparent_60%)]" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl bg-rose-400/30 animate-aurora" />
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl bg-fuchsia-500/25 animate-aurora-delayed" />
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
      `}</style>

      {!showTextOnly && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[85%] max-w-xl aspect-[4/3] rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_40px_rgba(255,120,200,0.3)]">
            <img
              key={images[index]}
              src={images[index]}
              alt="memories"
              className="w-full h-full object-contain bg-black/50 animate-in fade-in duration-300"
            />
          </div>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl text-center">
            <div className="rounded-2xl border border-white/20 bg-black/35 backdrop-blur-md px-6 py-4 text-lg md:text-2xl text-white/95 shadow-[0_0_30px_rgba(255,120,200,0.35)]" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em' }}>
              {captions[index % captions.length]}
            </div>
          </div>
        </div>
      )}

      {showTextOnly && (
        <div className="relative z-10 h-full flex items-center justify-center text-center px-8">
          <div className="text-2xl md:text-4xl font-black neo-font glow-text">
            Let’s look at our years together
          </div>
        </div>
      )}
    </div>
  );
};

export default EndingMontage;
