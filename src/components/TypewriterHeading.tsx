import { useTypewriter } from 'react-simple-typewriter'

type TypewriterHeadingProps = {
  words: string[]
  className?: string
}

export function TypewriterHeading({ words, className }: TypewriterHeadingProps) {
  const [text] = useTypewriter({
    words,
    loop: true,
    typeSpeed: 70,
    deleteSpeed: 40,
    delaySpeed: 1800,
  })

  return <span className={className}>{text}</span>
}
