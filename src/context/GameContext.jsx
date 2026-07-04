import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [rimuruHappiness, setRimuruHappiness] = useState(0)
  const [quest1Completed, setQuest1Completed] = useState(false)
  const [quest2Completed, setQuest2Completed] = useState(false)
  const [quest3Completed, setQuest3Completed] = useState(false)
  const [ingredients, setIngredients] = useState([])
  const [puzzleSolved, setPuzzleSolved] = useState(false)

  const updateHappiness = useCallback((amount) => {
    setRimuruHappiness((prev) => {
      const next = Math.min(100, Math.max(0, prev + amount))
      if (next >= 100) {
        setQuest1Completed(true)
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      rimuruHappiness,
      quest1Completed,
      quest2Completed,
      quest3Completed,
      ingredients,
      puzzleSolved,
      updateHappiness,
      setIngredients,
      setPuzzleSolved,
      setQuest2Completed,
      setQuest3Completed,
    }),
    [
      rimuruHappiness,
      quest1Completed,
      quest2Completed,
      quest3Completed,
      ingredients,
      puzzleSolved,
      updateHappiness,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
