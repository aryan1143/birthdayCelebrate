import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FOOD_BY_ID, getRandomFoodId } from '../assets/foodConfig'
import backgroundImage from '../assets/background.jpg'
import FoodItem from '../components/FoodItem'
import Slime from '../components/Slime'
import { useGame } from '../context/GameContext'
import QuestIntroModal from '../components/QuestIntroModal'
import { questNarration } from '../data/questNarration'

const FLOATING_TREAT_COUNT = 8
const FEEDBACK_DURATION = 1200
const SLIME_REACTION_MS = 800
const MIN_SPREAD = 14

// Keep treats in screen margins — away from header, happiness bar, and slime.
const SAFE_ZONES = [
  { xMin: 5, xMax: 24, yMin: 34, yMax: 88 },
  { xMin: 76, xMax: 95, yMin: 34, yMax: 88 },
  { xMin: 5, xMax: 28, yMin: 34, yMax: 48 },
  { xMin: 72, xMax: 95, yMin: 34, yMax: 48 },
  { xMin: 6, xMax: 36, yMin: 70, yMax: 90 },
  { xMin: 64, xMax: 94, yMin: 70, yMax: 90 },
]

function isInBlockedZone(x, y) {
  if (y < 32) return true
  if (y > 92) return true
  if (x > 28 && x < 72 && y > 30 && y < 74) return true
  return false
}

function generateScatterPosition(existingPositions = []) {
  const maxAttempts = 80

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const zone = SAFE_ZONES[Math.floor(Math.random() * SAFE_ZONES.length)]
    const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin)
    const y = zone.yMin + Math.random() * (zone.yMax - zone.yMin)

    if (isInBlockedZone(x, y)) continue

    const tooClose = existingPositions.some(
      (pos) => Math.hypot(pos.x - x, pos.y - y) < MIN_SPREAD,
    )
    if (tooClose) continue

    return { x, y }
  }

  const fallbackZone = SAFE_ZONES[Math.floor(Math.random() * SAFE_ZONES.length)]
  return {
    x: fallbackZone.xMin + Math.random() * (fallbackZone.xMax - fallbackZone.xMin),
    y: fallbackZone.yMin + Math.random() * (fallbackZone.yMax - fallbackZone.yMin),
  }
}

function createTrayItem(existingPositions = []) {
  const position = generateScatterPosition(existingPositions)
  return {
    instanceId: crypto.randomUUID(),
    foodId: getRandomFoodId(),
    x: position.x,
    y: position.y,
    floatDelay: Math.random() * 2,
  }
}

function createInitialTray() {
  const items = []
  for (let i = 0; i < FLOATING_TREAT_COUNT; i += 1) {
    items.push(createTrayItem(items))
  }
  return items
}

function FloatingDecor() {
  const decor = [
    { id: 'cloud-1', className: 'left-[8%] top-[12%] h-16 w-24 rounded-full bg-white/20 blur-sm' },
    { id: 'cloud-2', className: 'right-[10%] top-[20%] h-12 w-20 rounded-full bg-white/15 blur-sm' },
    { id: 'sparkle-1', className: 'left-[18%] bottom-[18%] h-3 w-3 rotate-45 bg-amber-200/30' },
    { id: 'sparkle-2', className: 'right-[22%] bottom-[28%] h-2 w-2 rotate-45 bg-pink-200/35' },
    { id: 'sparkle-3', className: 'left-[42%] top-[8%] h-2.5 w-2.5 rotate-45 bg-sky-200/30' },
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

export default function FeedQuest({ onComplete }) {
  const { rimuruHappiness, quest1Completed, updateHappiness } = useGame()
  const [trayItems, setTrayItems] = useState(createInitialTray)
  const [showIntro, setShowIntro] = useState(true)
  const [slimeState, setSlimeState] = useState('idle')
  const [feedback, setFeedback] = useState([])
  const respawnTimers = useRef(new Map())
  const slimeTimer = useRef(null)

  const setSlimeReaction = useCallback((state) => {
    if (slimeTimer.current) clearTimeout(slimeTimer.current)
    setSlimeState(state)
    slimeTimer.current = setTimeout(() => setSlimeState('idle'), SLIME_REACTION_MS)
  }, [])

  const spawnFeedback = useCallback((text) => {
    const id = crypto.randomUUID()
    setFeedback((prev) => [...prev, { id, text }])
    setTimeout(() => {
      setFeedback((prev) => prev.filter((item) => item.id !== id))
    }, FEEDBACK_DURATION)
  }, [])

  const scheduleRespawn = useCallback((removedInstanceId) => {
    if (respawnTimers.current.has(removedInstanceId)) return

    const timer = setTimeout(() => {
      setTrayItems((prev) => [...prev, createTrayItem(prev)])
      respawnTimers.current.delete(removedInstanceId)
    }, 1000)

    respawnTimers.current.set(removedInstanceId, timer)
  }, [])

  useEffect(() => {
    return () => {
      respawnTimers.current.forEach((timer) => clearTimeout(timer))
      if (slimeTimer.current) clearTimeout(slimeTimer.current)
    }
  }, [])

  function handleFeed(foodId, instanceId) {
    if (quest1Completed) return

    const food = FOOD_BY_ID[foodId]
    if (!food || !instanceId) return

    setTrayItems((prev) => prev.filter((item) => item.instanceId !== instanceId))
    scheduleRespawn(instanceId)

    if (food.good) {
      import('../utils/soundManager').then(m => m.playSfx('pop'))
      updateHappiness(10)
      setSlimeReaction('happy')
      spawnFeedback('+10 😋')
    } else {
      import('../utils/soundManager').then(m => m.playSfx('wrong'))
      setSlimeReaction('sad')
      spawnFeedback('🤢')
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white/25" aria-hidden="true" />

      <div className={`h-full w-full transition-all duration-300 ${showIntro ? 'pointer-events-none select-none blur-[2px] brightness-90' : ''}`}>
        <div className="pointer-events-none fixed inset-0 z-50">
          <AnimatePresence mode="popLayout">
            {trayItems.map((item) => (
              <FoodItem
                key={item.instanceId}
                instanceId={item.instanceId}
                foodId={item.foodId}
                x={item.x}
                y={item.y}
                floatDelay={item.floatDelay}
                disabled={quest1Completed}
                onFeed={handleFeed}
              />
            ))}
          </AnimatePresence>
        </div>

        <section className="pointer-events-none relative z-40 mx-auto flex h-full max-w-3xl flex-col items-center justify-start px-4 py-4 pt-6">
          <FloatingDecor />

          <header className="relative mb-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Quest 1
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-normal text-slate-800 sm:text-4xl">Feed Rimuru</h1>
            <p className="mt-2 text-slate-500">Tap a treat to feed Rimuru. Skip the bitter ones!</p>
          </header>

          <div className="relative mb-4 w-full max-w-md">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>Rimuru&apos;s Happiness</span>
              <span>{rimuruHappiness}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${rimuruHappiness}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          <div className="pointer-events-auto relative mb-4">
            <Slime
              state={slimeState}
              full={quest1Completed}
              className="min-h-[180px] min-w-[220px] rounded-3xl"
            />

            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <AnimatePresence>
                {feedback.map((item) => (
                  <motion.span
                    key={item.id}
                    initial={{ opacity: 0, y: 8, scale: 0.8 }}
                    animate={{ opacity: 1, y: -24, scale: 1.15 }}
                    exit={{ opacity: 0, y: -48, scale: 0.9 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className={`text-3xl font-bold drop-shadow-sm ${
                      item.text.includes('🤢') ? 'text-rose-500' : 'text-emerald-600'
                    }`}
                  >
                    {item.text}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {quest1Completed && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                className="pointer-events-auto absolute left-1/2 top-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border-4 border-pink-200 bg-sky-50/95 p-6 text-center shadow-2xl backdrop-blur-sm"
              >
                <p className="font-semibold leading-relaxed text-slate-600 text-sm md:text-base">
                  &quot;Rimuru is completely full! Great job! 🎉&quot;
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
        </section>
      </div>

      <QuestIntroModal
        questTitle={questNarration.feed.title}
        instructions={questNarration.feed.instructions}
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
      />
    </div>
  )

}
