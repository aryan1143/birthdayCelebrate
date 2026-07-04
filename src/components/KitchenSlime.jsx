import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Slime from './Slime'
import { GRID_COLS, GRID_ROWS } from '../data/kitchenGrid'

export default function KitchenSlime({ col, row, path, onPathComplete, onStep }) {
  const [cellPos, setCellPos] = useState({ col, row })
  const [facingRight, setFacingRight] = useState(true)
  const [isHopping, setIsHopping] = useState(false)

  // Execute the path sequentially
  useEffect(() => {
    if (!path || path.length === 0) {
      setIsHopping(false)
      return
    }

    setIsHopping(true)
    let isCancelled = false
    let stepIndex = 0

    const hopNext = () => {
      if (isCancelled) return

      if (stepIndex >= path.length) {
        setIsHopping(false)
        if (onPathComplete) onPathComplete()
        return
      }

      const nextCell = path[stepIndex]

      // Turn to face movement direction
      if (nextCell.col > cellPos.col) setFacingRight(true)
      else if (nextCell.col < cellPos.col) setFacingRight(false)

      // Move to the next grid coordinate
      setCellPos(nextCell)
      
      // Trigger any per-step logic (like collecting ingredients we step on)
      if (onStep) onStep(nextCell)

      stepIndex++

      // Wait for the hop animation duration (~250ms) before hopping again
      setTimeout(hopNext, 280)
    }

    hopNext()

    return () => {
      isCancelled = true
    }
  }, [path]) // Only re-run when a new path is given

  // Calculate percentage positions for responsive container
  const leftPerc = (cellPos.col + 0.5) * (100 / GRID_COLS)
  const topPerc = (cellPos.row + 0.5) * (100 / GRID_ROWS)

  return (
    <motion.div
      className="pointer-events-none absolute z-20 flex flex-col items-center justify-end -translate-x-1/2"
      initial={{ left: `${leftPerc}%`, top: `${topPerc}%` }}
      animate={{
        left: `${leftPerc}%`,
        top: `${topPerc}%`,
        scaleX: facingRight ? 1 : -1,
      }}
      transition={{
        // Smooth horizontal translation
        left: { duration: 0.25, ease: 'linear' },
        top: { duration: 0.25, ease: 'linear' },
      }}
      style={{
        // The pivot is at the bottom-center of the slime.
        // We use -translate-x-1/2 (via Tailwind) and a negative top margin
        // so its feet sit at the `topPerc` y-coordinate.
        marginTop: -36,
        width: 48,
        height: 48,
      }}
    >
      <motion.div
        animate={
          isHopping
            ? {
                y: [0, -14, 0], // The hop arc (slightly smaller for small slime)
                scaleY: [0.9, 1.1, 0.95], // Squash and stretch
              }
            : {
                y: [0, -3, 0], // Idle bob
                scaleY: [1, 1.02, 1],
              }
        }
        transition={{
          duration: isHopping ? 0.25 : 1.5,
          repeat: isHopping ? 0 : Infinity, // Only repeat if idle, handled per hop otherwise
          ease: 'easeInOut',
        }}
        className="flex h-full w-full items-end justify-center"
      >
        <Slime state="idle" className="h-[36px]" />
      </motion.div>
    </motion.div>
  )
}
