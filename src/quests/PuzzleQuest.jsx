/**
 * FUTURE CUSTOMIZATION INSTRUCTIONS:
 *
 * 1. SWAPPING THE IMAGE:
 *    To replace the placeholder graphic with your own custom artwork or photograph,
 *    update the `REAL_IMAGE_SRC` constant in `src/assets/puzzleConfig.js`.
 *    Specify the path to your image (e.g. '/assets/my_image.png').
 *
 * 2. GRID SIZE ASSUMPTIONS:
 *    The component currently supports any NxN grid layout, default is 3x3 (9 pieces) as set in `puzzleConfig.js`.
 *    To change the grid difficulty:
 *    - Update `gridSize` in `src/assets/puzzleConfig.js` to 4 (for 4x4) or 5 (for 5x5).
 *    - The layout and slice calculations will scale dynamically.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

import backgroundImage from '../assets/background.jpg'
import { useGame } from '../context/GameContext'
import QuestIntroModal from '../components/QuestIntroModal'
import { questNarration } from '../data/questNarration'
import { playSfx } from '../utils/soundManager'
import { puzzleConfig } from '../assets/puzzleConfig'
import PuzzlePiece from '../components/PuzzlePiece'

function FloatingDecor() {
  const decor = [
    { id: 'cloud-1', className: 'left-[8%] top-[12%] h-16 w-24 rounded-full bg-white/20 blur-sm' },
    { id: 'cloud-2', className: 'right-[10%] top-[20%] h-12 w-20 rounded-full bg-white/15 blur-sm' },
    { id: 'sparkle-1', className: 'left-[18%] bottom-[18%] h-3 w-3 rotate-45 bg-pink-200/20' },
    { id: 'sparkle-2', className: 'right-[22%] bottom-[28%] h-2 w-2 rotate-45 bg-pink-200/25' },
    { id: 'sparkle-3', className: 'left-[42%] top-[8%] h-2.5 w-2.5 rotate-45 bg-sky-200/20' },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {decor.map((item, index) => (
        <motion.div
          key={item.id}
          className={`absolute ${item.className}`}
          animate={{
            x: [0, index % 2 === 0 ? 18 : -14, 0],
            y: [0, -12, 0],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10 + index * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function shufflePieces(size) {
  const count = size * size
  const initial = Array.from({ length: count }, (_, i) => i)

  let shuffled
  let attempts = 0

  while (attempts < 100) {
    shuffled = [...initial]

    // Fisher-Yates shuffle
    for (let i = count - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    // Check correct count
    let correctCount = 0
    for (let i = 0; i < count; i += 1) {
      if (shuffled[i] === initial[i]) {
        correctCount += 1
      }
    }

    // Ensure it is not solved and not trivially easy (less than 4 correct initially)
    if (correctCount < count && correctCount <= 3) {
      break
    }
    attempts += 1
  }

  return shuffled.map((correctIndex) => ({
    id: `piece-${correctIndex}`,
    correctIndex,
  }))
}

export default function PuzzleQuest({ onComplete }) {
  const { puzzleSolved, setPuzzleSolved, setQuest2Completed } = useGame()
  const [showIntro, setShowIntro] = useState(true)
  const [pieces, setPieces] = useState([])
  const [selectedPieceIndex, setSelectedPieceIndex] = useState(null)
  const [isSolved, setIsSolved] = useState(false)

  const gridSize = puzzleConfig.gridSize

  // Initialize and shuffle pieces on mount
  useEffect(() => {
    if (puzzleSolved) {
      setIsSolved(true)
      const count = gridSize * gridSize
      setPieces(
        Array.from({ length: count }, (_, i) => ({
          id: `piece-${i}`,
          correctIndex: i,
        })),
      )
    } else {
      setPieces(shufflePieces(gridSize))
    }
  }, [puzzleSolved, gridSize])

  const handlePieceClick = (clickedIndex) => {
    if (isSolved) return

    if (selectedPieceIndex === null) {
      setSelectedPieceIndex(clickedIndex)
    } else {
      // Clicking the same piece again deselects it
      if (selectedPieceIndex === clickedIndex) {
        setSelectedPieceIndex(null)
        return
      }

      // Play swap sound
      playSfx('swap')

      // Swap pieces in state
      setPieces((prevPieces) => {
        const nextPieces = [...prevPieces]
        const temp = nextPieces[selectedPieceIndex]
        nextPieces[selectedPieceIndex] = nextPieces[clickedIndex]
        nextPieces[clickedIndex] = temp

        // Check solve condition
        const solved = nextPieces.every((piece, idx) => piece.correctIndex === idx)
        if (solved) {
          setIsSolved(true)
          setPuzzleSolved(true)
          setQuest2Completed(true)
          playSfx('chime')

          // Win confetti burst from center of puzzle
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.5 },
          })
        }

        return nextPieces
      })

      setSelectedPieceIndex(null)
    }
  }

  const correctCount = pieces.filter((piece, index) => piece.correctIndex === index).length

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background configurations */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white/25" aria-hidden="true" />

      {/* Main interactive grid container */}
      <div
        className={`mx-auto flex h-full max-w-3xl flex-col items-center justify-start px-4 py-4 pt-6 transition-all duration-300 ${
          showIntro ? 'pointer-events-none select-none blur-[2px] brightness-90' : ''
        }`}
      >
        <FloatingDecor />

        <header className="relative mb-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Quest 2
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-normal text-slate-800 sm:text-4xl">Piece It Together</h1>
          <p className="mt-2 text-slate-500 text-sm">Select a piece, then select another to swap them!</p>
        </header>

        {/* Progress tracker info */}
        <div className="relative mb-4 w-full max-w-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Puzzle Alignment</span>
            <span className="font-bold text-pink-500">
              {correctCount} / {gridSize * gridSize} Correct
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-pink-400"
              initial={{ width: 0 }}
              animate={{ width: `${(correctCount / (gridSize * gridSize)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </div>
        </div>

        {/* Puzzle Board Area */}
        <div className="relative aspect-square w-full max-w-[340px] rounded-[2rem] border border-white/50 bg-white/70 p-3 shadow-lg backdrop-blur-sm sm:max-w-[380px] md:max-w-[400px]">
          <div
            className="grid h-full w-full gap-2"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {pieces.map((piece, index) => {
              const isSelected = selectedPieceIndex === index
              return (
                <PuzzlePiece
                  key={piece.id}
                  id={piece.id}
                  correctIndex={piece.correctIndex}
                  currentIndex={index}
                  gridSize={gridSize}
                  imageSrc={puzzleConfig.imageSrc}
                  isSolved={isSolved}
                  isSelected={isSelected}
                  onClick={() => handlePieceClick(index)}
                />
              )
            })}
          </div>
        </div>

        {/* Celebratory dialogues and navigation */}
        <AnimatePresence>
          {isSolved && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="pointer-events-auto absolute left-1/2 top-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border-4 border-pink-200 bg-sky-50/95 p-6 text-center shadow-2xl backdrop-blur-sm"
            >
              <p className="font-semibold leading-relaxed text-slate-600 text-sm md:text-base">
                &quot;You pieced it back together! Rimuru would be so proud. 🎉&quot;
              </p>

              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="mt-4 rounded-2xl bg-pink-400 hover:bg-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                Continue Quest ➔
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quest Intro Modal */}
      <QuestIntroModal
        questTitle={questNarration.puzzle.title}
        instructions={questNarration.puzzle.instructions}
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
      />
    </div>
  )
}
