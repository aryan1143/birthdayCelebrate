import QuestProgressBar from './QuestProgressBar'

export default function QuestLayout({ children }) {
  return (
    <div className="relative h-svh w-full overflow-hidden">
      <div className="fixed top-0 right-0 left-0 z-[60]">
        <QuestProgressBar />
      </div>
      <div className="h-full overflow-hidden pt-[4.75rem]">{children}</div>
    </div>
  )
}
