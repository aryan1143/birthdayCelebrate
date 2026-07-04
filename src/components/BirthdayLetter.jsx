import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playMusic, playSfx } from "../utils/soundManager";
import { useTypewriter } from "../hooks/useTypewriter";
import { LETTER_CONTENT } from "../data/letterContent";
import backgroundImage from "../assets/background.jpg";
import letterBgImage from "../assets/letter-bg.png";

export default function BirthdayLetter({ name, onFinish }) {
  const [stage, setStage] = useState("envelope"); // 'envelope', 'opening', 'letter', 'end'
  const [lineIndex, setLineIndex] = useState(-1); // -1 is the greeting, 0+ are the lines
  const [showHint, setShowHint] = useState(false);

  // Hint delay
  useEffect(() => {
    if (stage === "envelope") {
      const timer = setTimeout(() => setShowHint(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const openEnvelope = () => {
    if (stage !== "envelope") return;
    setStage("opening");

    // Play sounds
    playSfx("envelope");
    playMusic("letter", 1200);

    // Transition to letter after animation
    setTimeout(() => {
      setStage("letter");
      setLineIndex(-1); // Start with greeting
    }, 1200);
  };

  // Determine current text
  const currentText =
    lineIndex === -1
      ? LETTER_CONTENT.greeting.replace("Friend", name)
      : LETTER_CONTENT.lines[lineIndex] || "";

  const { displayedText, isComplete, skip } = useTypewriter({
    text: currentText,
    speed: 45,
    isActive:
      (stage === "letter" || stage === "end") &&
      lineIndex < LETTER_CONTENT.lines.length,
  });

  // Auto-advance logic
  useEffect(() => {
    if (stage !== "letter") return;

    if (isComplete) {
      if (lineIndex < LETTER_CONTENT.lines.length - 1) {
        // Wait briefly, then go to next line
        const timer = setTimeout(() => {
          setLineIndex((prev) => prev + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else if (lineIndex === LETTER_CONTENT.lines.length - 1) {
        // We reached the end of the letter
        const timer = setTimeout(() => {
          setStage("end");
          playSfx("sparkle");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isComplete, stage, lineIndex]);

  const handleScreenClick = () => {
    if (stage === "letter" && !isComplete) {
      skip();
    }
  };

  // Collect previous lines to display them as a block above the currently typing line
  const previousLines = LETTER_CONTENT.lines.slice(0, Math.max(0, lineIndex));

  return (
    <div
      className="relative flex h-svh w-full flex-col items-center justify-center overflow-hidden bg-slate-900"
      onClick={handleScreenClick}
    >
      {/* Blurred Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 blur-sm"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Stage 1: Envelope */}
      <AnimatePresence>
        {(stage === "envelope" || stage === "opening") && (
          <motion.div
            key="envelope-container"
            className="absolute z-20 flex flex-col items-center justify-center cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 50, transition: { duration: 0.8 } }}
            onClick={openEnvelope}
          >
            {/* The Envelope Graphic */}
            <motion.div
              className="relative flex h-48 w-72 items-center justify-center rounded-lg bg-pink-100 shadow-2xl overflow-hidden"
              animate={
                stage === "envelope" ? { y: [0, -8, 0] } : { scale: 1.1 }
              }
              transition={{
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                scale: { duration: 0.8 },
              }}
            >
              {/* Back flap */}
              <div className="absolute inset-0 border-[40px] border-transparent border-t-pink-200" />
              <div className="absolute inset-0 border-[40px] border-transparent border-b-pink-200 border-l-pink-50/50 border-r-pink-50/50" />

              {/* Wax seal */}
              <motion.div
                className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 shadow-sm border-2 border-rose-600"
                animate={
                  stage === "opening"
                    ? { scale: 0, opacity: 0 }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.3 }}
              >
                <span className="text-white text-xl">🌸</span>
              </motion.div>

              {/* Opening Flap Animation */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1/2 origin-top bg-pink-200 shadow-sm"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: stage === "opening" ? 180 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Hint text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: showHint && stage === "envelope" ? 0.7 : 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 text-sm font-medium text-white tracking-widest uppercase"
            >
              Tap to open
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 2: The Letter */}
      <AnimatePresence>
        {(stage === "letter" || stage === "end") && (
          <motion.div
            key="letter-container"
            className="absolute z-30 flex w-full max-w-lg flex-col items-center justify-center p-6"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div
              className="w-full rounded-sm bg-cover bg-center bg-no-repeat bg-[#f8fbff] px-8 pt-16 pb-28 md:px-12 md:pt-24 md:pb-40 shadow-2xl border border-blue-900/10 min-h-[60vh] max-h-[85vh] overflow-y-auto custom-scrollbar"
              style={{ backgroundImage: `url(${letterBgImage})` }}
            >
              {/* Greeting */}
              <h1 className="mb-4 font-serif text-2xl md:text-3xl font-semibold leading-loose text-blue-950/80">
                {lineIndex === -1
                  ? displayedText
                  : LETTER_CONTENT.greeting.replace("Friend", name)}
              </h1>

              {/* Previous Lines */}
              <div className="flex flex-col space-y-2 font-serif text-lg md:text-xl text-blue-950/70 leading-relaxed">
                {previousLines.map((line, i) => (
                  <p
                    key={i}
                    className={`opacity-100 ${i >= LETTER_CONTENT.lines.length - 2 ? "text-right" : ""}`}
                  >
                    {line}
                  </p>
                ))}

                {/* Currently Typing Line */}
                {lineIndex >= 0 && (
                  <p
                    className={`min-h-[1.5em] ${lineIndex >= LETTER_CONTENT.lines.length - 2 ? "text-right" : ""}`}
                  >
                    {displayedText}
                    {!isComplete && (
                      <span className="inline-block w-1.5 h-5 ml-1 bg-blue-900/40 animate-pulse align-middle" />
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Sparkles on end */}
            <AnimatePresence>
              {stage === "end" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <div className="w-full h-full border-[20px] border-white/20 blur-xl rounded-xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 3: The End Button */}
      <AnimatePresence>
        {stage === "end" && onFinish && (
          <motion.div
            key="end-button"
            className="absolute bottom-8 z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <button
              onClick={onFinish}
              className="rounded-full bg-white/10 border border-white/30 backdrop-blur-md px-8 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              Replay the journey?
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
