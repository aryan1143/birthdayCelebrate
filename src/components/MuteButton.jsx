import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { toggleMute, getIsMuted, playSfx } from '../utils/soundManager'

export default function MuteButton() {
  const [muted, setMuted] = useState(false)

  // Sync with global singleton on mount
  useEffect(() => {
    setMuted(getIsMuted())
  }, [])

  const handleToggle = () => {
    const isNowMuted = toggleMute()
    setMuted(isNowMuted)
    if (!isNowMuted) {
      playSfx('button') // Give a little feedback when unmuting
    }
  }

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed top-4 right-4 z-[999] flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm border border-slate-200 transition-colors hover:bg-white text-slate-600"
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
    </motion.button>
  )
}
