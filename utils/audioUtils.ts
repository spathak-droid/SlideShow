
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
const praiseCache = new Map<string, AudioBuffer>();
let currentPraiseSource: AudioBufferSourceNode | null = null;
let lastSparkleAt = 0;
let lastPraiseAt = 0;
let tickBuffer: AudioBuffer | null = null;
const PRAISE_AUDIO: Record<string, string> = {
  "sweet": "sounds/SFX - Sweet.mp3",
  "tasty": "sounds/SFX - Tasty.mp3",
  "delicious": "sounds/SFX - Delicious.mp3",
  "divine": "sounds/SFX - Divine.mp3",
};

/**
 * Play a magical chime sound using Web Audio oscillators
 */
function playSparkle() {
  const nowMs = performance.now();
  if (nowMs - lastSparkleAt < 700) return;
  lastSparkleAt = nowMs;

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.1, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  masterGain.connect(audioCtx.destination);

  const freqs = [880, 1320, 1760, 2640];
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.05);
    osc.connect(masterGain);
    osc.start(now + i * 0.05);
    osc.stop(now + 1);
  });
}

export function playBell() {
  const nowMs = performance.now();
  if (nowMs - lastSparkleAt < 300) return;
  lastSparkleAt = nowMs;
  playTick();
}

/**
 * Trigger the Gemini TTS voice callout
 */
export async function speakPraise(text: string) {
  try {
    const nowMs = performance.now();
    if (nowMs - lastPraiseAt < 1200) return;
    lastPraiseAt = nowMs;

    playBell(); // Single tick per praise
    await new Promise(resolve => setTimeout(resolve, 500));

    const key = normalizePraise(text);
    if (!key) return;

    const cached = praiseCache.get(key);
    if (cached) {
      await playBuffer(cached);
      return;
    }

    const audioBuffer = await fetchPraiseBuffer(key);
    if (audioBuffer) {
      praiseCache.set(key, audioBuffer);
      await playBuffer(audioBuffer);
      return;
    }
  } catch (error) {
    console.error("Audio feedback error:", error);
  }
}

async function fetchPraiseBuffer(key: string): Promise<AudioBuffer | null> {
  const src = PRAISE_AUDIO[key];
  if (!src) return null;
  const res = await fetch(src);
  const arrayBuffer = await res.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

async function playTick() {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  if (!tickBuffer) {
    const res = await fetch('sounds/tickSound.mp3');
    const arrayBuffer = await res.arrayBuffer();
    tickBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  }
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = tickBuffer;
  gain.gain.value = 0.5;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

async function playBuffer(buffer: AudioBuffer) {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  if (currentPraiseSource) {
    try {
      currentPraiseSource.stop();
    } catch {
      // Ignore if already stopped.
    }
    currentPraiseSource.disconnect();
    currentPraiseSource = null;
  }
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buffer;
  gain.gain.value = 0.6;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  currentPraiseSource = source;
  source.start();
}

export function stopPraiseAudio() {
  if (currentPraiseSource) {
    try {
      currentPraiseSource.stop();
    } catch {
      // Ignore if already stopped.
    }
    currentPraiseSource.disconnect();
    currentPraiseSource = null;
  }
}

export async function preloadPraiseClips(words: string[]) {
  const unique = [...new Set(words)];
  await Promise.all(unique.map(async (word) => {
    const key = normalizePraise(word);
    if (!key || praiseCache.has(key)) return;
    try {
      const audioBuffer = await fetchPraiseBuffer(key);
      if (audioBuffer) praiseCache.set(key, audioBuffer);
    } catch {
      // Ignore preload errors; live playback will retry.
    }
  }));
}

function normalizePraise(text: string) {
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned in PRAISE_AUDIO) return cleaned;
  return null;
}

export async function ensureAudioReady() {
  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      // Ignore; browsers may block without a user gesture.
    }
  }
}
