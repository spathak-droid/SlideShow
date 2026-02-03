
import React, { useRef, useEffect, useState } from 'react';
import { ensureAudioReady } from '../utils/audioUtils';

interface VideoIntroProps {
  onComplete: () => void;
  autoplayWithSound?: boolean;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete, autoplayWithSound = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(!autoplayWithSound);
  const [showChapter, setShowChapter] = useState(true);

  const scenes = [
    { label: "Scene I: The Vanishing", chapter: "Chapter 1", title: "The Vanishing", src: "Storyboard.mp4" },
    { label: "Scene II: The Trial", chapter: "Chapter 2", title: "The Trial", src: "Storyboard2.mp4" },
  ];
  const [sceneIndex, setSceneIndex] = useState(0);

  const attemptPlay = async () => {
    if (!videoRef.current) return;
    
    try {
      setError(null);
      // If we have a user gesture already, try sound autoplay.
      videoRef.current.muted = !autoplayWithSound;
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setIsBlocked(false);
        setIsLoading(false);
        if (autoplayWithSound) {
          setIsMuted(false);
        }
      }
    } catch (err: any) {
      console.warn("Muted autoplay attempt status:", err.name);
      if (err.name === 'NotAllowedError') {
        setIsBlocked(true);
      }
      if (autoplayWithSound) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
      setIsLoading(false);
    }
  };

  const handleInteraction = async () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.muted = false;
      setIsMuted(false);
      await videoRef.current.play();
      setIsBlocked(false);
      ensureAudioReady();
    } catch (err) {
      console.error("Interaction play failed:", err);
      // Fallback to muted if unmuting fails
      videoRef.current.muted = true;
      setIsMuted(true);
      videoRef.current.play().catch(() => {
        setError("Playback failed even after user interaction.");
      });
    }
  };

  useEffect(() => {
    if (!showChapter) return;
    setIsLoading(true);
    const chapterTimer = setTimeout(() => {
      setShowChapter(false);
      // Force the video element to re-evaluate the source
      if (videoRef.current) {
        videoRef.current.load();
      }
      attemptPlay();
    }, 4000);

    return () => {
      clearTimeout(chapterTimer);
    };
  }, [sceneIndex, showChapter]);

  useEffect(() => {
    if (showChapter) return;
    // Safety timeout to hide loader even if video is stubborn
    const timer = setTimeout(() => {
      if (isLoading && !error) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [showChapter, sceneIndex, isLoading, error]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoNode = e.currentTarget;
    const errorDetails = videoNode.error;
    let message = "The video file could not be loaded.";
    
    if (errorDetails) {
      console.error("Video Resource Error:", {
        code: errorDetails.code,
        message: errorDetails.message
      });
      
      switch (errorDetails.code) {
        case 1: message = "Video loading aborted."; break;
        case 2: message = "Network error while downloading the video."; break;
        case 3: message = "Video decoding failed. The file format may be unsupported or corrupted."; break;
        case 4: message = `File not found: Ensure '${scenes[sceneIndex]?.src}' is at the root of your project.`; break;
      }
    }
    setError(message);
    setIsLoading(false);
  };

  const handleEnded = () => {
    if (sceneIndex < scenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
      setShowChapter(true);
      setIsLoading(true);
      setError(null);
      setIsMuted(!autoplayWithSound);
      return;
    }
    onComplete();
  };

  const handleSkip = () => {
    if (sceneIndex < scenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
      setShowChapter(true);
      setIsLoading(true);
      setError(null);
      setIsMuted(!autoplayWithSound);
      return;
    }
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 min-h-[100svh] min-w-[100vw] z-[350] bg-black flex items-center justify-center overflow-hidden" 
      onClick={handleInteraction}
    >
      {!showChapter && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onEnded={handleEnded}
          onPlay={() => {
            ensureAudioReady();
          }}
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
          <source src={scenes[sceneIndex].src} type="video/mp4" />
          <source src={`./${scenes[sceneIndex].src}`} type="video/mp4" />
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
              {scenes[sceneIndex].chapter}
            </div>
            <div className="text-3xl md:text-5xl font-black neo-font glow-text chapter-anim">
              {scenes[sceneIndex].title}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[355]">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold fancy-font animate-pulse text-xl">Loading Cinematic...</p>
        </div>
      )}

      {/* Play/Sound Overlay */}
      {!isLoading && !error && (isBlocked || (isMuted && !autoplayWithSound)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] z-[360] transition-opacity duration-500 pointer-events-none">
           <div className="bg-white/10 p-10 rounded-full border border-white/20 animate-pulse mb-6">
              <div className="text-7xl text-white ml-2">🔊</div>
           </div>
           <p className="text-white text-3xl font-black fancy-font drop-shadow-lg text-center px-6">
             {isBlocked ? "Tap to Play" : "Tap for Sound"}
           </p>
           <p className="text-pink-300/80 text-xs mt-4 font-bold tracking-widest uppercase">Love's Cinematic Journey</p>
        </div>
      )}

      {/* Error State with Debug Info */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-10 text-center z-[370]">
          <div className="text-6xl mb-6">📂⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Cinematic Load Failed</h2>
          <div className="text-sm text-slate-400 mb-8 max-w-sm font-mono bg-black/50 p-4 rounded border border-white/10 text-left">
            <p className="text-pink-400 mb-2 font-bold">{error}</p>
            <p className="text-[10px] opacity-50 uppercase tracking-tighter">Path Attempted: {videoSrc}</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
              className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all"
            >
              Reload Page
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleSkip(); }}
              className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-bold shadow-xl transition-all"
            >
              Skip to Gameplay
            </button>
          </div>
        </div>
      )}
      
      {/* Persistent Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-8 right-8 px-6 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all active:scale-90 z-[380]"
      >
        Skip ➔
      </button>

      {/* Title */}
      {!isLoading && !error && (
        <div className="absolute bottom-10 left-10 text-white/20 text-[10px] font-black tracking-[0.3em] uppercase pointer-events-none z-[360]">
          {scenes[sceneIndex].label}
        </div>
      )}
    </div>
  );
};

export default VideoIntro;
