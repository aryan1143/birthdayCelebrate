import { Howl } from 'howler'

const sounds = new Map<string, Howl>()

export function playSound(src: string, volume = 0.5) {
  let sound = sounds.get(src)

  if (!sound) {
    sound = new Howl({ src: [src], volume })
    sounds.set(src, sound)
  }

  sound.volume(volume)
  sound.play()
}

export function preloadSound(src: string, volume = 0.5) {
  if (sounds.has(src)) return

  const sound = new Howl({ src: [src], volume, preload: true })
  sounds.set(src, sound)
}
