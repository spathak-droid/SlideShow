
import React, { useEffect, useState } from 'react';

interface PraiseOverlayProps {
  text: string;
  onFinished: () => void;
}

const COLORS = [
  'text-pink-500',
  'text-yellow-400',
  'text-purple-500',
  'text-cyan-400',
  'text-orange-500'
];

const PraiseOverlay: React.FC<PraiseOverlayProps> = ({ text, onFinished }) => {
  const [visible, setVisible] = useState(false);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinished, 500); // Wait for fade out
    }, 1500);
    return () => clearTimeout(timer);
  }, [text, onFinished]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
      <style>{`
        @keyframes candy-pop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          40% { transform: scale(1.4) rotate(5deg); opacity: 1; }
          60% { transform: scale(1.2) rotate(-2deg); }
          100% { transform: scale(1.1) rotate(0); opacity: 1; }
        }
        .animate-candy-pop {
          animation: candy-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      
      <div 
        className={`
          transition-all duration-500 
          ${visible ? 'animate-candy-pop' : 'opacity-0 scale-150 blur-sm'}
          ${color}
          text-6xl md:text-8xl font-black fancy-font drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]
          stroke-white stroke-2
        `}
        style={{
          WebkitTextStroke: '3px white',
          filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))'
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default PraiseOverlay;
