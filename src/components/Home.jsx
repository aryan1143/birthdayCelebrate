import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import backgroundImage from "../assets/background.jpg";
import Slime from "./Slime";
import { unlockAudio, playMusic, playSfx } from "../utils/soundManager";

const INTRO_LINES = [
  `Rimuru woke up today knowing something was different...`,
  `It's your birthday — and that means today has to be special.`,
  `He's gathered a few small quests to make it unforgettable, just for you.`,
  `Ready to begin, Koaibiettoilaai?`,
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.22, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

function FloatingDecor() {
  const decor = [
    {
      id: "cloud-1",
      className:
        "left-[6%] top-[14%] h-20 w-28 rounded-full bg-white/25 blur-sm",
    },
    {
      id: "cloud-2",
      className:
        "right-[8%] top-[22%] h-14 w-24 rounded-full bg-white/20 blur-sm",
    },
    {
      id: "sparkle-1",
      className: "left-[20%] bottom-[20%] h-3 w-3 rotate-45 bg-amber-200/40",
    },
    {
      id: "sparkle-2",
      className:
        "right-[18%] bottom-[30%] h-2.5 w-2.5 rotate-45 bg-pink-200/45",
    },
    {
      id: "sparkle-3",
      className: "left-[45%] top-[10%] h-2 w-2 rotate-45 bg-sky-200/40",
    },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {decor.map((item, index) => (
        <motion.div
          key={item.id}
          className={`absolute ${item.className}`}
          animate={{
            x: [0, index % 2 === 0 ? 16 : -12, 0],
            y: [0, -10, 0],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{
            duration: 9 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function TypewriterText({ text, delay = 0, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let timeout;
    let interval;

    timeout = setTimeout(() => {
      let idx = 0;
      interval = setInterval(() => {
        idx += 1;
        setDisplayedText(text.slice(0, idx));
        if (idx >= text.length) {
          clearInterval(interval);
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }, 38);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  return <span>{displayedText}</span>;
}

export default function Home({ name = "Friend", onStart }) {
  const [activeLine, setActiveLine] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Unlock and play on first tap
  const handleInteraction = () => {
    if (!isStarted) {
      unlockAudio();
      playMusic("quest");
      setIsStarted(true);
    }
  };

  const handleStart = (e) => {
    e.stopPropagation(); // prevent double firing
    unlockAudio();
    playSfx("button");
    playMusic("quest");
    onStart();
  };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-100/40 via-white/30 to-pink-100/40"
        aria-hidden="true"
      />

      <FloatingDecor />

      {/* Tap to Begin Overlay - Resolves AudioContext warnings */}
      {!isStarted && (
        <div
          className="absolute inset-0 z-50 flex cursor-pointer items-center justify-center bg-white/30 backdrop-blur-sm transition-opacity hover:bg-white/20 px-4"
          onClick={handleInteraction}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col gap-4 items-center justify-center rounded-3xl bg-white/80 p-8 text-center shadow-xl backdrop-blur-md border-3 border-pink-400"
          >
            <Slime state="idle" className="mb-4 h-[100px]" />
            <h2 className="text-2xl font-black leading-normal tracking-widest text-pink-500 uppercase">
              Tap Anywhere
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              to begin the adventure
            </p>
          </motion.div>
        </div>
      )}

      {isStarted && (
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 py-8 text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Slime state="idle" className="min-h-[140px]" />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-500"
          >
            Birthday Adventure
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="mt-3 text-3xl font-black leading-normal text-pink-500 sm:text-4xl md:text-5xl drop-shadow-sm"
          >
            A Little Adventure Awaits, {name}…
          </motion.h1>

          <div className="mt-8 max-w-md space-y-4 min-h-[120px]">
            {INTRO_LINES.map((line, index) => (
              <div
                key={line}
                className="text-lg font-bold leading-relaxed text-slate-600 sm:text-xl md:text-2xl"
              >
                {index <= activeLine && (
                  <TypewriterText
                    text={line}
                    delay={index === 0 ? 1000 : 200}
                    onComplete={() =>
                      setActiveLine(Math.max(activeLine, index + 1))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: activeLine >= INTRO_LINES.length ? 1 : 0,
              y: activeLine >= INTRO_LINES.length ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
            className="relative mt-8"
          >
            <motion.button
              type="button"
              onClick={handleStart}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95, y: 4, rotate: 1 }}
              className="relative rounded-3xl bg-pink-400 px-10 py-4 text-xl font-black tracking-widest text-white shadow-xl shadow-pink-200/50 border-b-[6px] border-pink-500 hover:bg-pink-300 transition-colors"
            >
              Begin Quest ✿
            </motion.button>
          </motion.div>
        </motion.main>
      )}
    </div>
  );
}
