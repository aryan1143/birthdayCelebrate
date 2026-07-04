import { motion } from 'framer-motion'

export default function PuzzlePiece({
  correctIndex,
  currentIndex,
  gridSize,
  imageSrc,
  isSolved,
  isSelected,
  onClick,
}) {
  const row = Math.floor(correctIndex / gridSize)
  const col = correctIndex % gridSize

  // Position offsets: calculate X and Y in percentages to slice the full background image
  const bgX = col === 0 ? 0 : col === gridSize - 1 ? 100 : (col / (gridSize - 1)) * 100
  const bgY = row === 0 ? 0 : row === gridSize - 1 ? 100 : (row / (gridSize - 1)) * 100

  const isCorrect = correctIndex === currentIndex

  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      disabled={isSolved}
      className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 border-2 outline-none
        ${isSolved
          ? 'border-transparent shadow-none cursor-default'
          : isSelected
            ? 'border-sky-400 ring-4 ring-sky-300/60 z-20 scale-[1.03] shadow-md'
            : isCorrect
              ? 'border-pink-300 ring-2 ring-pink-200/50 shadow-[0_0_12px_rgba(244,143,177,0.45)]'
              : 'border-slate-200/60 hover:border-pink-200 hover:scale-[1.01]'
        }
      `}
      animate={{
        scale: isSelected ? 1.04 : 1,
        boxShadow: isSelected
          ? '0 10px 15px -3px rgba(56, 189, 248, 0.3), 0 4px 6px -4px rgba(56, 189, 248, 0.3)'
          : isCorrect && !isSolved
            ? '0 0 12px rgba(244,143,177,0.45)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Slice image representation */}
      <div
        className="h-full w-full pointer-events-none"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${bgX}% ${bgY}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Subtle pulsing background glow on correctly placed piece */}
      {isCorrect && !isSolved && !isSelected && (
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-0 bg-pink-300/15"
        />
      )}

      {/* Selection overlay border and highlight */}
      {isSelected && (
        <div className="absolute inset-0 bg-sky-400/10 pointer-events-none border border-sky-400 rounded-2xl" />
      )}
    </motion.button>
  )
}
