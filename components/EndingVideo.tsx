import React, { useEffect, useRef, useState } from 'react';
import { ensureAudioReady } from '../utils/audioUtils';

interface EndingVideoProps {
  onComplete: () => void;
  autoplayWithSound?: boolean;
}

const EndingVideo: React.FC<EndingVideoProps> = ({ onComplete, autoplayWithSound = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(!autoplayWithSound);
  const [showChapter, setShowChapter] = useState(true);

  const videoSrc = 'EndingVideo.mp4';

  const attemptPlay = async () => {
    if (!videoRef.current) return;
    try {
      setError(null);
      videoRef.current.muted = !autoplayWithSound;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsBlocked(false);
        setIsLoading(false);
        if (autoplayWithSound) setIsMuted(false);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') setIsBlocked(true);
      if (autoplayWithSound) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showChapter) return;
    const chapterTimer = setTimeout(() => {
      setShowChapter(false);
      if (videoRef.current) videoRef.current.load();
      attemptPlay();
    }, 4000);
    return () => clearTimeout(chapterTimer);
  }, [showChapter]);

  useEffect(() => {
    if (showChapter) return;
    const timer = setTimeout(() => {
      if (isLoading && !error) setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showChapter, isLoading, error]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoNode = e.currentTarget;
    const errorDetails = videoNode.error;
    let message = 'The video file could not be loaded.';
    if (errorDetails) {
      switch (errorDetails.code) {
        case 1: message = 'Video loading aborted.'; break;
        case 2: message = 'Network error while downloading the video.'; break;
        case 3: message = 'Video decoding failed. The file format may be unsupported or corrupted.'; break;
        case 4: message = `File not found: Ensure '${videoSrc}' is at the root of your project.`; break;
      }
    }
    setError(message);
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[350] bg-black flex items-center justify-center overflow-hidden"
      onClick={() => {
        if (!videoRef.current) return;
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play().catch(() => {});
      }}
    >
      {!showChapter && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onEnded={onComplete}
          onPlay={() => ensureAudioReady()}
          onLoadedData={() => {
            setIsLoading(false);
            setError(null);
          }}
          onCanPlay={() => setIsLoading(false)}
          onError={handleVideoError}
          playsInline
          autoPlay
          muted={isMuted}
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={`./${videoSrc}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {showChapter && (
        <div className="absolute inset-0 min-h-[100svh] min-w-[100vw] z-[360] bg-[#090811] text-white overflow-hidden flex items-center justify-center">
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
            @keyframes chapter-reveal {
              0% { opacity: 0; transform: translateY(10px) scale(0.98); letter-spacing: 0.35em; }
              60% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 0.22em; }
              100% { opacity: 1; transform: translateY(0) scale(1.02); letter-spacing: 0.28em; }
            }
            .chapter-anim { animation: chapter-reveal 1.8s ease-out forwards; }
          `}</style>
          <div className="relative z-10 text-center">
            <div className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/60 mb-3">
              Chapter 3
            </div>
            <div className="text-3xl md:text-5xl font-black neo-font glow-text chapter-anim">
              Together Again
            </div>
          </div>
        </div>
      )}

      {isLoading && !error && !showChapter && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[355]">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold fancy-font animate-pulse text-xl">Loading Cinematic...</p>
        </div>
      )}

      {!isLoading && !error && (isBlocked || (isMuted && !autoplayWithSound)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] z-[360] transition-opacity duration-500 pointer-events-none">
           <div className="bg-white/10 p-10 rounded-full border border-white/20 animate-pulse mb-6">
              <div className="text-7xl text-white ml-2">🔊</div>
           </div>
           <p className="text-white text-3xl font-black fancy-font drop-shadow-lg text-center px-6">
             {isBlocked ? "Tap to Play" : "Tap for Sound"}
           </p>
           <p className="text-pink-300/80 text-xs mt-4 font-bold tracking-widest uppercase">Final Reunion</p>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className="absolute top-8 right-8 px-6 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all active:scale-90 z-[380]"
      >
        Skip ➔
      </button>
    </div>
  );
};

export default EndingVideo;
