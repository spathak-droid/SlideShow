
import React, { useState, useEffect } from 'react';

interface StoryIntroProps {
  onComplete: () => void;
}

const StoryIntro: React.FC<StoryIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  // stages: 
  // 0: Happy world
  // 1: Monster arrival
  // 2: Capture
  // 3: Chaining
  // 4: Call to action

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 3000), // Monster arrives
      setTimeout(() => setStage(2), 6000), // Monster grabs husband
      setTimeout(() => setStage(3), 9000), // Husband chained
      setTimeout(() => setStage(4), 12000), // Challenge
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className={`fixed inset-0 overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center p-8 text-center
      ${stage === 0 ? 'bg-pink-100' : stage === 1 ? 'bg-indigo-950' : 'bg-slate-900'}
    `}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes monster-shake {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1) rotate(2deg); }
        }
        @keyframes husband-snatch {
          to { transform: translate(150px, -200px) scale(0.5) rotate(180deg); opacity: 0; }
        }
        @keyframes chain-appear {
          from { transform: scale(2); opacity: 0; filter: blur(10px); }
          to { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-monster { animation: monster-shake 0.5s ease-in-out infinite; }
        .animate-snatch { animation: husband-snatch 1.5s ease-in forwards; }
        .animate-chain { animation: chain-appear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      <div className="relative w-full max-w-2xl h-[400px]">
        
        {/* Peaceful World Background Objects */}
        {stage === 0 && (
          <div className="absolute inset-0 flex justify-around items-center opacity-40">
             <div className="text-6xl animate-float" style={{ animationDelay: '0s' }}>🍭</div>
             <div className="text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🍬</div>
             <div className="text-6xl animate-float" style={{ animationDelay: '1s' }}>🍫</div>
             <div className="text-5xl animate-float" style={{ animationDelay: '1.5s' }}>🧁</div>
          </div>
        )}

        {/* The Couple (Wife & Husband) */}
        <div className="absolute inset-0 flex items-center justify-center gap-12">
          {/* Wife */}
          <div className="flex flex-col items-center z-10 transition-transform duration-1000">
             <div className="text-8xl">👸</div>
             <div className="bg-white/90 px-4 py-2 rounded-2xl mt-4 font-bold text-pink-600 shadow-lg fancy-font">
                {stage === 0 ? "My Sweetheart!" : stage === 1 ? "What's happening?!" : "OH NO!"}
             </div>
          </div>

          {/* Husband */}
          {stage < 2 && (
            <div className={`flex flex-col items-center z-10 ${stage === 1 ? 'animate-bounce' : ''}`}>
               <div className="text-8xl">🤵</div>
               <div className="bg-white/90 px-4 py-2 rounded-2xl mt-4 font-bold text-blue-600 shadow-lg fancy-font">
                 {stage === 0 ? "I love you!" : "SAVE ME!"}
               </div>
            </div>
          )}
        </div>

        {/* The Monster Arrival */}
        {stage >= 1 && (
          <div className="absolute top-0 right-0 left-0 flex flex-col items-center transition-all duration-1000 transform translate-y-[-50px]">
             <div className={`text-[12rem] drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] ${stage >= 1 ? 'animate-monster' : ''}`}>
               {stage < 4 ? '👹' : '👺'}
             </div>
             {stage === 1 && (
               <div className="bg-black text-white px-8 py-4 rounded-3xl mt-4 text-2xl font-black uppercase border-4 border-red-600 animate-pulse">
                 GRRRRRAAAAAHHH!
               </div>
             )}
          </div>
        )}

        {/* Snatch Animation */}
        {stage === 2 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ml-24 z-20 animate-snatch">
             <div className="text-8xl">🤵</div>
          </div>
        )}

        {/* Bound Husband in Chains */}
        {stage >= 3 && (
          <div className="absolute top-0 right-0 left-0 flex flex-col items-center justify-center h-full pt-32">
             <div className="relative">
                <div className="text-9xl opacity-40 grayscale">🤵</div>
                <div className="absolute inset-0 flex items-center justify-center gap-8 animate-chain">
                   <div className="text-7xl drop-shadow-lg">⛓️</div>
                   <div className="text-7xl drop-shadow-lg">⛓️</div>
                </div>
             </div>
             {stage === 3 && (
               <div className="mt-8 text-white fancy-font text-3xl animate-pulse">
                  Bound by the Bitter Magic!
               </div>
             )}
          </div>
        )}

        {/* The Villain's Decree */}
        {stage === 4 && (
          <div className="absolute inset-x-0 bottom-0 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 animate-in fade-in slide-in-from-bottom duration-500">
             <p className="text-white text-xl md:text-2xl font-bold italic mb-6">
                "Only by mastering the Candy Trials can your love be freed!"
             </p>
             <button
              onClick={onComplete}
              className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full font-bold text-2xl shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-110 transition-transform active:scale-95 animate-bounce"
            >
              FREE HIM!
            </button>
          </div>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-auto pb-8">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === stage ? 'w-8 bg-pink-400' : 'w-2 bg-pink-200 opacity-30'}`} />
        ))}
      </div>
    </div>
  );
};

export default StoryIntro;
