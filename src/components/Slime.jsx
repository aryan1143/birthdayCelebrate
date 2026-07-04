import { motion } from 'framer-motion'
import slimeImage from '../assets/rimuru.png'
import happySlimeImage from '../assets/happy-rimuru.png'
import sadSlimeImage from '../assets/sad-rimuru.png'

const stateVariants = {
  idle: {
    y: [0, -8, 0],
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    transition: {
      y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  happy: {
    y: [0, -14, 0, -6, 0],
    scaleX: [1, 1.12, 0.92, 1.08, 1],
    scaleY: [1, 0.88, 1.14, 0.94, 1],
    rotate: [0, -2, 2, 0],
    transition: { duration: 0.8, ease: 'easeInOut' },
  },
  sad: {
    y: [0, 6, 4],
    scaleX: [1, 1.06, 1.04],
    scaleY: [1, 0.92, 0.94],
    rotate: [0, -3, -2],
    transition: { duration: 0.8, ease: 'easeInOut' },
  },
}

export default function Slime({ state = 'idle', full = false, className = '' }) {
  const imageSrc = full || state === 'happy' ? happySlimeImage : (state === 'sad' ? sadSlimeImage : slimeImage)

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      aria-label="Rimuru"
    >
      <motion.img
        key={full ? 'full' : state}
        src={imageSrc}
        alt="Rimuru"
        variants={stateVariants}
        animate={full ? 'idle' : state}
        initial={full ? { scale: 0.9, opacity: 1 } : false}
        draggable={false}
        className="h-40 w-auto select-none object-contain"
      />
    </motion.div>
  )
}
