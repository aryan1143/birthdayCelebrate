import { Howl, Howler } from "howler";

const DEFAULT_MUSIC_VOLUME = 0.4;
const DEFAULT_SFX_VOLUME = 0.6;

// Mute state is global to Howler, but we track it here for UI components to query
let isMuted = false;

let currentTrackName = null;
let currentMusicHowl = null;
let hasUnlocked = false;

// Import all existing audio files in src/assets/audio so Vite bundles them
const audioAssets = import.meta.glob("../assets/audio/*.{mp3,wav,ogg}", {
  eager: true,
  import: "default",
});

function getAudioUrl(filename) {
  const srcPath = `../assets/audio/${filename}`;
  if (audioAssets[srcPath]) {
    // If the file exists in src/assets, use the Vite-bundled URL
    return audioAssets[srcPath];
  }
  // Otherwise, fallback to the absolute path (e.g. if it's in public/ or missing)
  return `/assets/audio/${filename}`;
}

const TRACKS = {
  quest: getAudioUrl("quest-bgm.mp3"),
  cake: getAudioUrl("cake-bgm.mp3"),
  letter: getAudioUrl("letter-bgm.mp3"),
};

const SFX = {
  pop: getAudioUrl("pop.mp3"),
  wrong: getAudioUrl("wrong.mp3"),
  chime: getAudioUrl("chime.mp3"),
  hop: getAudioUrl("hop.mp3"),
  whoosh: getAudioUrl("whoosh.mp3"),
  sad: getAudioUrl("sad.mp3"),
  cheer: getAudioUrl("cheer.mp3"),
  sparkle: getAudioUrl("sparkle.mp3"),
  envelope: getAudioUrl("envelope-open.mp3"),
  button: getAudioUrl("button-click.mp3"),
  swap: getAudioUrl("swap.mp3"),
};

// Caches for Howl instances
const musicCache = {};
const sfxCache = {};

function createHowl(src, isMusic) {
  return new Howl({
    src: [src],
    loop: isMusic,
    volume: isMusic ? DEFAULT_MUSIC_VOLUME : DEFAULT_SFX_VOLUME,
    onloaderror: () => {
      console.warn(
        `[soundManager] Audio file missing or failed to load: ${src}`,
      );
    },
    onplayerror: () => {
      console.warn(`[soundManager] Audio play error: ${src}`);
    },
  });
}

/**
 * Satisfies mobile autoplay restrictions.
 * Should be called on the first user interaction (e.g. clicking 'Begin Quest')
 */
export function unlockAudio() {
  if (hasUnlocked) return;
  hasUnlocked = true;

  // Create an empty, silent Howl to initialize the audio context
  const silentNode = new Howl({
    src: [
      "data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
    ],
    volume: 0,
  });
  silentNode.play();
}

export function playMusic(trackName, fadeDuration = 800) {
  if (currentTrackName === trackName) return; // Already playing

  const src = TRACKS[trackName];
  if (!src) {
    console.warn(`[soundManager] Unknown music track: ${trackName}`);
    return;
  }

  if (!musicCache[trackName]) {
    musicCache[trackName] = createHowl(src, true);
  }

  const nextHowl = musicCache[trackName];

  // If there's an existing track playing, fade it out
  if (currentMusicHowl) {
    const oldHowl = currentMusicHowl;
    oldHowl.fade(oldHowl.volume(), 0, fadeDuration);
    oldHowl.once("fade", () => {
      oldHowl.stop();
    });
  }

  // Play and fade in the new track
  nextHowl.volume(0);
  nextHowl.play();
  nextHowl.fade(0, DEFAULT_MUSIC_VOLUME, fadeDuration);

  currentMusicHowl = nextHowl;
  currentTrackName = trackName;
}

export function stopMusic(fadeDuration = 800) {
  if (currentMusicHowl) {
    const oldHowl = currentMusicHowl;
    oldHowl.fade(oldHowl.volume(), 0, fadeDuration);
    oldHowl.once("fade", () => {
      oldHowl.stop();
    });
    currentMusicHowl = null;
    currentTrackName = null;
  }
}

export function playSfx(sfxName) {
  const src = SFX[sfxName];
  if (!src) {
    console.warn(`[soundManager] Unknown SFX: ${sfxName}`);
    return;
  }

  if (!sfxCache[sfxName]) {
    sfxCache[sfxName] = createHowl(src, false);
  }

  // Calling play() on an existing Howl instance automatically supports
  // concurrent overlapping sounds in howler.js
  sfxCache[sfxName].play();
}

export function toggleMute() {
  isMuted = !isMuted;
  Howler.mute(isMuted);
  return isMuted;
}

export function getIsMuted() {
  return isMuted;
}
