/**
 * Transition label configuration.
 * Maps page-to-page transitions to display-friendly labels for the
 * QuestTransition chapter-break screen.
 *
 * Each key is the "from" page, containing the "to" page and the labels
 * shown during the transition cinematic.
 */
export const transitionMap = {
  home: {
    to: 'feed',
    fromLabel: 'Prologue',
    fromTitle: 'A Little Adventure',
    toLabel: 'Quest 1',
    toTitle: 'Feed Rimuru',
  },
  feed: {
    to: 'puzzle',
    fromLabel: 'Quest 1',
    fromTitle: 'Feed Rimuru',
    toLabel: 'Quest 2',
    toTitle: 'The Puzzle',
  },
  puzzle: {
    to: 'ingredients',
    fromLabel: 'Quest 2',
    fromTitle: 'The Puzzle',
    toLabel: 'Quest 3',
    toTitle: 'Gather Ingredients',
  },
  ingredients: {
    to: 'cake',
    fromLabel: 'Quest 3',
    fromTitle: 'Gather Ingredients',
    toLabel: '',
    toTitle: 'The Cake',
  },
  cake: {
    to: 'letter',
    fromLabel: '',
    fromTitle: 'The Cake',
    toLabel: '',
    toTitle: 'A Letter For You',
  },
}
