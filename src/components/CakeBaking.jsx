import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Slime from "./Slime";
import { playMusic, playSfx } from "../utils/soundManager";

function TypewriterText({ text, speed = 40 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayed}</>;
}

const STAGES = [
  "gather",
  "mixing",
  "mistake",
  "recovery",
  "oven",
  "plate",
  "layers",
  "cream",
  "strawberries",
  "candles",
  "sparkles",
  "glow",
  "finished",
];

// How long each stage lasts before auto-advancing (in ms)
const STAGE_DURATIONS = {
  gather: 2000,
  mixing: 2500,
  mistake: null, // MANUAL ADVANCE ONLY (waits for player click)
  recovery: 1500,
  oven: 3000,
  plate: 800,
  layers: 1000,
  cream: 1000,
  strawberries: 1200,
  candles: 1000,
  sparkles: 1500,
  glow: 1200,
  finished: null, // Stops here
};

export default function CakeBaking({ name, onComplete }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  const currentStage = STAGES[stageIndex];
  const finalMessage = `Here's your cake, ${name}... made with a little bit of everything we found today. Happy Birthday! 🎂, ohhhh no I almost fogot I have a letter for you.`;

  useEffect(() => {
    const duration = STAGE_DURATIONS[currentStage];

    // Play sounds based on stage entry
    if (currentStage === "gather") playSfx("whoosh");
    if (currentStage === "mistake") playSfx("sad");
    if (currentStage === "sparkles") playSfx("sparkle");

    // If null, we don't auto-advance
    if (duration === null) return;

    const timer = setTimeout(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, duration);

    return () => clearTimeout(timer);
  }, [currentStage]);

  // Start music on mount
  useEffect(() => {
    playMusic("cake");
  }, []);

  // Typewriter effect for the final message
  useEffect(() => {
    if (currentStage === "finished") {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        setTypedText(finalMessage.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex >= finalMessage.length) clearInterval(typeInterval);
      }, 50);
      return () => clearInterval(typeInterval);
    }
  }, [currentStage, finalMessage]);

  // Helpers for determining what's on screen based on the current stage sequence
  const isPast = (stageName) => stageIndex > STAGES.indexOf(stageName);
  const isAtOrPast = (stageName) => stageIndex >= STAGES.indexOf(stageName);

  return (
    <div className="relative flex h-svh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 to-pink-100">
      {/* --- SCENE AREA --- */}
      <div className="relative flex min-h-[350px] w-full max-w-sm flex-col items-center justify-center pb-8">
        {/* Slime Character positioned above the action */}
        <div className="relative z-20 flex w-full flex-col items-center">
          <Slime
            state={
              currentStage === "mistake"
                ? "sad"
                : currentStage === "finished"
                  ? "happy"
                  : currentStage === "recovery" || currentStage === "glow"
                    ? "happy"
                    : "idle"
            }
            className="h-[120px]"
          />

          {/* Mistake Dialogue Bubble */}
          <AnimatePresence>
            {currentStage === "mistake" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-[100px] z-30 rounded-2xl rounded-tl-sm bg-white p-3 shadow-lg min-h-[44px]"
              >
                <p className="text-sm font-semibold text-slate-600">
                  <TypewriterText text="Oh no... I think I messed it up..." />
                </p>
              </motion.div>
            )}

            {/* Recovery Dialogue Bubble */}
            {currentStage === "recovery" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-[100px] z-30 rounded-2xl rounded-tl-sm bg-white p-3 shadow-lg min-h-[44px]"
              >
                <p className="text-sm font-semibold text-slate-600">
                  <TypewriterText text="Okay... let's try that again!" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center action area (Mixing / Oven / Cake Assembly) */}
        <div className="relative mt-16 flex h-[160px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Stage: Gather & Mixing */}
            {(currentStage === "gather" ||
              currentStage === "mixing" ||
              currentStage === "mistake" ||
              currentStage === "recovery") && (
              <motion.div
                key="mixing-bowl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: currentStage === "mixing" ? [-5, 5, -5] : 0,
                  x:
                    currentStage === "mistake" ? [-10, 10, -8, 8, -4, 4, 0] : 0,
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 0.4 },
                  x: { duration: 0.4 }, // shake duration
                }}
                exit={{ scale: 0, opacity: 0, y: 50 }}
                className="relative text-7xl"
              >
                🥣
                {/* Ingredients flying in */}
                {currentStage === "gather" && (
                  <motion.div
                    className="absolute -top-12 left-0 right-0 flex justify-around text-2xl"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 20, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span>🌾</span>
                    <span>🥚</span>
                    <span>🥛</span>
                  </motion.div>
                )}
                {/* Mistake splat! */}
                {currentStage === "mistake" && (
                  <motion.div
                    className="absolute -right-6 top-4 text-3xl"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1.5, rotate: 0 }}
                  >
                    💨
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Stage: Oven */}
            {currentStage === "oven" && (
              <motion.div
                key="oven"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-8xl"
              >
                <motion.div
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🔥
                </motion.div>
              </motion.div>
            )}

            {/* Stage: Plate -> Finished */}
            {isAtOrPast("plate") && (
              <motion.div
                key="cake-assembly"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative flex flex-col items-center justify-end pb-4"
              >
                {/* Cake Layers */}
                <div className="relative flex flex-col items-center">
                  {/* Candles */}
                  <AnimatePresence>
                    {isAtOrPast("candles") && (
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 10, opacity: 1 }}
                        className="absolute -top-12 z-20 flex space-x-2 text-2xl"
                      >
                        <motion.span
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ repeat: Infinity, duration: 0.4 }}
                        >
                          🕯️
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                          🕯️
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ repeat: Infinity, duration: 0.45 }}
                        >
                          🕯️
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Strawberries */}
                  <AnimatePresence>
                    {isAtOrPast("strawberries") && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-4 z-10 flex space-x-1 text-xl"
                      >
                        <span>🍓</span>
                        <span>🍓</span>
                        <span>🍓</span>
                        <span>🍓</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Cream Base */}
                  <AnimatePresence>
                    {isAtOrPast("cream") && (
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        className="h-4 w-32 rounded-t-xl bg-white shadow-sm"
                      />
                    )}
                  </AnimatePresence>

                  {/* Layers */}
                  <AnimatePresence>
                    {isAtOrPast("layers") && (
                      <motion.div
                        initial={{
                          scaleY: 0,
                          opacity: 0,
                          transformOrigin: "bottom",
                        }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        className="flex flex-col gap-0.5"
                      >
                        <div className="h-6 w-32 bg-amber-700" />
                        <div className="h-2 w-32 bg-rose-500" />
                        <div className="h-6 w-32 bg-amber-700" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Plate */}
                  <div className="mt-1 h-3 w-40 rounded-full bg-slate-200 shadow-md border-b-2 border-slate-300" />
                </div>

                {/* Sparkles & Glow */}
                <AnimatePresence>
                  {isAtOrPast("sparkles") && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-4xl"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0.5, 1], scale: 1.2 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✨
                    </motion.div>
                  )}
                </AnimatePresence>

                {isAtOrPast("glow") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -inset-10 -z-10 rounded-full bg-yellow-300/30 blur-2xl"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- UI AREA (Below the scene) --- */}
      <div className="mt-8 flex w-full max-w-md flex-col items-center justify-start px-6 min-h-[160px]">
        {/* Mistake Interaction Button */}
        <AnimatePresence>
          {currentStage === "mistake" && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: [1, 1.05, 1] }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
              transition={{
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
              }}
              onClick={() => {
                playSfx("cheer");
                setStageIndex(STAGES.indexOf("recovery"));
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-pink-200 border-[3px] border-white px-8 py-4 text-lg font-extrabold text-pink-500 shadow-sm transition-colors hover:bg-pink-300 hover:text-white"
            >
              Cheer him up! 🌸
            </motion.button>
          )}
        </AnimatePresence>

        {/* Finished Interaction & Text */}
        <AnimatePresence>
          {currentStage === "finished" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <p className="min-h-[80px] text-lg font-semibold leading-relaxed text-slate-700">
                {typedText}
              </p>

              {/* Show continue button only after text finishes typing */}
              {typedText === finalMessage && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onComplete}
                  className="mt-6 rounded-full bg-sky-200 border-[3px] border-white px-10 py-3 font-extrabold text-sky-600 shadow-sm transition-colors hover:bg-sky-300 hover:text-white"
                >
                  Get letter ✉️
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
