import { useState, useEffect, useCallback } from 'react'

export function useTypewriter({ text, speed = 38, isActive = true }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Reset when text changes or becomes inactive
  useEffect(() => {
    if (!isActive) {
      setDisplayedText('')
      setIsComplete(false)
      return
    }

    // Small delay before starting a new line can be nice, 
    // but we'll let the orchestrator handle line delays.
    setDisplayedText('')
    setIsComplete(false)

    let idx = 0
    const interval = setInterval(() => {
      idx += 1
      setDisplayedText(text.slice(0, idx))
      
      if (idx >= text.length) {
        clearInterval(interval)
        setIsComplete(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, isActive])

  const skip = useCallback(() => {
    if (!isComplete && isActive) {
      setDisplayedText(text)
      setIsComplete(true)
    }
  }, [isComplete, isActive, text])

  return { displayedText, isComplete, skip }
}
