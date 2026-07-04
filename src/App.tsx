import { useState } from 'react'
import Home from './components/Home.jsx'
import QuestLayout from './components/QuestLayout.jsx'
import QuestTransition from './components/QuestTransition.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { transitionMap } from './data/transitionConfig.js'
import FeedQuest from './quests/FeedQuest.jsx'
import IngredientsQuest from './quests/IngredientsQuest.jsx'
import PuzzleQuest from './quests/PuzzleQuest.jsx'

import Preloader from './components/Preloader.jsx'

import CakeBaking from './components/CakeBaking.jsx'

import BirthdayLetter from './components/BirthdayLetter.jsx'

import MuteButton from './components/MuteButton.jsx'

const RECIPIENT_NAME = 'Friend'

type Page = 'home' | 'feed' | 'puzzle' | 'ingredients' | 'cake' | 'letter'

interface TransitionState {
  fromPage: Page
  toPage: Page
  fromLabel: string
  fromTitle: string
  toLabel: string
  toTitle: string
}

function App() {
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [page, setPage] = useState<Page>('home')
  const [transition, setTransition] = useState<TransitionState | null>(null)

  // Starts a transition cinematic instead of instantly switching pages
  function beginTransition(fromPage: Page) {
    if (!(fromPage in transitionMap)) return
    const config = transitionMap[fromPage as keyof typeof transitionMap]

    setTransition({
      fromPage,
      toPage: config.to as Page,
      fromLabel: config.fromLabel,
      fromTitle: config.fromTitle,
      toLabel: config.toLabel,
      toTitle: config.toTitle,
    })
  }

  // Called when the transition cinematic finishes — actually switches the page
  function handleTransitionEnd() {
    if (transition) {
      setPage(transition.toPage)
    }
    setTransition(null)
  }

  return (
    <GameProvider>
      <MuteButton />

      {!isPreloaded && <Preloader onComplete={() => setIsPreloaded(true)} />}

      {isPreloaded && page === 'home' && (
        <Home name={RECIPIENT_NAME} onStart={() => beginTransition('home')} />
      )}

      {isPreloaded && page === 'feed' && (
        <QuestLayout>
          <FeedQuest onComplete={() => beginTransition('feed')} />
        </QuestLayout>
      )}

      {isPreloaded && page === 'puzzle' && (
        <QuestLayout>
          <PuzzleQuest onComplete={() => beginTransition('puzzle')} />
        </QuestLayout>
      )}

      {isPreloaded && page === 'ingredients' && (
        <QuestLayout>
          <IngredientsQuest onComplete={() => beginTransition('ingredients')} />
        </QuestLayout>
      )}

      {isPreloaded && page === 'cake' && (
        <CakeBaking 
          name={RECIPIENT_NAME} 
          onComplete={() => beginTransition('cake')} 
        />
      )}

      {isPreloaded && page === 'letter' && (
        <BirthdayLetter 
          name={RECIPIENT_NAME}
          onFinish={() => {
            // Optional: Loop back to start
            setPage('home')
          }}
        />
      )}

      {/* Transition cinematic overlay */}
      {isPreloaded && transition && (
        <QuestTransition
          fromLabel={transition.fromLabel}
          fromTitle={transition.fromTitle}
          toLabel={transition.toLabel}
          toTitle={transition.toTitle}
          onTransitionEnd={handleTransitionEnd}
        />
      )}


      {/* Dev Menu */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-[9999] flex flex-wrap gap-2 rounded-xl bg-black/80 p-3 shadow-xl max-w-[200px]">
          <span className="w-full text-xs font-bold text-white/50 mb-1">DEV NAVIGATION</span>
          {['home', 'feed', 'puzzle', 'ingredients', 'cake', 'letter'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setTransition(null)
                setPage(p as Page)
              }}
              className="px-2 py-1 bg-white/10 hover:bg-white/25 rounded text-xs text-white capitalize transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </GameProvider>
  )
}

export default App
