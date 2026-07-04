import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useGame } from '../context/GameContext'

const QUEST_META = [
  { emoji: '🫧', label: 'Feed Rimuru' },
  { emoji: '🧩', label: 'Solve Puzzle' },
  { emoji: '🎂', label: 'Gather Ingredients' },
]

function getCurrentQuest({ quest1Completed, quest2Completed, quest3Completed }) {
  if (!quest1Completed) return 1
  if (!quest2Completed) return 2
  if (!quest3Completed) return 3
  return 3
}

function getNodeState(questNum, flags, currentQuest) {
  if (flags[questNum - 1]) return 'completed'
  if (questNum === currentQuest) return 'current'
  return 'upcoming'
}

function ProgressNode({ emoji, state, label }) {
  const isCompleted = state === 'completed'
  const isCurrent = state === 'current'

  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-20">
      <motion.div
        layout
        animate={{
          scale: isCurrent ? 1.15 : isCompleted ? 1 : 0.85,
          opacity: state === 'upcoming' ? 0.75 : 1,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
          isCompleted
            ? 'border-emerald-400 bg-emerald-50 shadow-[0_0_12px_rgba(52,211,153,0.55)]'
            : isCurrent
              ? 'border-fuchsia-400 bg-fuchsia-100 shadow-[0_0_14px_rgba(232,121,249,0.5)]'
              : 'border-slate-300 bg-white/60'
        }`}
      >
        <span className="text-lg leading-none select-none" aria-hidden="true">
          {emoji}
        </span>

        {isCompleted && (
          <motion.span
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16 }}
            className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white"
          >
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </motion.span>
        )}

        {isCurrent && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-fuchsia-300"
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
      <span
        className={`hidden text-center text-[10px] leading-tight font-medium sm:block ${
          isCurrent ? 'text-fuchsia-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function Connector({ completed }) {
  return (
    <motion.div
      className="mt-5 h-0.5 w-10 shrink-0 rounded-full sm:w-16"
      animate={{
        backgroundColor: completed ? 'rgb(52 211 153)' : 'rgb(203 213 225)',
      }}
      transition={{ duration: 0.4 }}
    />
  )
}

export default function QuestProgressBar() {
  const { quest1Completed, quest2Completed, quest3Completed } = useGame()

  const flags = [quest1Completed, quest2Completed, quest3Completed]
  const currentQuest = getCurrentQuest({ quest1Completed, quest2Completed, quest3Completed })
  const allDone = quest1Completed && quest2Completed && quest3Completed

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-b border-white/50 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-2">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          {allDone
            ? '🎉 All quests complete!'
            : `${QUEST_META[currentQuest - 1].emoji} Quest ${currentQuest} of 3`}
        </p>

        <div className="flex items-start justify-center">
          {QUEST_META.map(({ emoji, label }, index) => {
            const questNum = index + 1
            const state = getNodeState(questNum, flags, currentQuest)

            return (
              <div key={label} className="flex items-start">
                <ProgressNode emoji={emoji} state={state} label={label} />
                {questNum < 3 && <Connector completed={flags[questNum - 1]} />}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
