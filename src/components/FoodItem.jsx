import { motion } from 'framer-motion'
import { FOOD_BY_ID } from '../assets/foodConfig'

export default function FoodItem({
  foodId,
  instanceId,
  x,
  y,
  floatDelay = 0,
  disabled = false,
  onFeed,
}) {
  const food = FOOD_BY_ID[foodId]

  if (!food) return null

  function handleClick() {
    if (disabled) return
    onFeed?.(foodId, instanceId)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.88 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-auto absolute flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      aria-label={`Feed Rimuru ${food.name}`}
    >
      <motion.div
        layout={false}
        animate={{
          y: [0, -8, 0],
          x: [0, 4, -3, 0],
        }}
        transition={{
          y: {
            duration: 3.2 + (floatDelay % 3) * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: floatDelay,
          },
          x: {
            duration: 4.5 + (floatDelay % 2) * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: floatDelay * 0.6,
          },
        }}
        className="flex flex-col items-center gap-1"
      >
        <img
          src={food.imageSrc}
          alt=""
          className="pointer-events-none h-20 w-20 select-none object-contain drop-shadow-md sm:h-24 sm:w-24"
          draggable={false}
        />
        <span className="pointer-events-none rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          {food.name}
        </span>
      </motion.div>
    </motion.button>
  )
}
