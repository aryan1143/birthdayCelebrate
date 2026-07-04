import confetti from 'canvas-confetti'

export function fireConfetti(options?: confetti.Options) {
  return confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    ...options,
  })
}
