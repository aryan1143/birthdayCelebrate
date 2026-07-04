import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Slime from './Slime'

// Automatically import all assets in the assets folder
const assets = import.meta.glob('../assets/**/*.{jpg,jpeg,png,svg,gif,webp,mp3,wav,ogg}', {
  eager: true,
  import: 'default',
})

const assetUrls = Object.values(assets)

const allAssets = [...assetUrls]

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let loadedCount = 0
    const totalCount = allAssets.length

    if (totalCount === 0) {
      setIsLoaded(true)
      return
    }

    const handleLoad = () => {
      loadedCount += 1
      setProgress(Math.round((loadedCount / totalCount) * 100))
      if (loadedCount === totalCount) {
        // Add a tiny delay so the 100% is visible for a moment
        setTimeout(() => setIsLoaded(true), 400)
      }
    }

    allAssets.forEach((url) => {
      // For images, Image constructor is fast and caches well
      if (url.match(/\.(jpg|jpeg|png|svg|gif|webp)$/i)) {
        const img = new Image()
        img.src = url
        img.onload = handleLoad
        img.onerror = handleLoad
      } 
      // For audio or other assets, fetch ensures they are fully downloaded to browser cache
      else {
        fetch(url)
          .then(res => {
            // Check if response is ok (won't be for missing public placeholders, which is fine)
            if (!res.ok) throw new Error('Not found')
            handleLoad()
          })
          .catch(handleLoad) // Count failures as loaded so we don't hang
      }
    })
  }, [])

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {!isLoaded && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-sky-50 px-6 text-center"
        >
          <div className="mb-8">
            <Slime state="idle" className="min-h-[120px]" />
          </div>

          <h1 className="text-2xl font-black text-pink-500 mb-6">Preparing Surprise...</h1>
          
          <div className="w-full max-w-[240px]">
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-pink-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">{progress}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
