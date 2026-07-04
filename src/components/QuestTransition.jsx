/**
 * QuestTransition — Chapter-break screen between quests.
 *
 * Three auto-advancing stages:
 *   Stage 1 (~1s)   — "Quest Complete!" pop-in + sparkle burst
 *   Stage 2 (~1.5s) — Chapter card with from→to label transition
 *   Stage 3 (~0.6s) — Fade-out wipe, then calls onTransitionEnd
 *
 * Framer Motion exit technique: simple opacity + scale crossfade.
 * A vertical clip-path wipe was prototyped but opacity crossfade is
 * more reliable across browsers and GPU-composited, so we use that.
 * Swap to clipPath animate if you want the cinematic wipe later:
 *   animate={{ clipPath: "inset(0 0 0 0)" }}
 *   exit={{ clipPath: "inset(0 0 100% 0)" }}
 *
 * Safety: a hard setTimeout(onTransitionEnd, 5000) fires as a fallback
 * so a broken animation can never soft-lock the app.
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { playSfx } from "../utils/soundManager";

// Decorative floating elements (reuse visual language from quest screens)
function FloatingDecor() {
  const decor = [
    {
      id: "t-cloud-1",
      className:
        "left-[6%] top-[14%] h-20 w-28 rounded-full bg-white/15 blur-sm",
    },
    {
      id: "t-cloud-2",
      className:
        "right-[8%] top-[22%] h-14 w-22 rounded-full bg-white/10 blur-sm",
    },
    {
      id: "t-sparkle-1",
      className: "left-[20%] bottom-[20%] h-3 w-3 rotate-45 bg-pink-200/25",
    },
    {
      id: "t-sparkle-2",
      className: "right-[18%] bottom-[30%] h-2.5 w-2.5 rotate-45 bg-sky-200/20",
    },
    {
      id: "t-sparkle-3",
      className: "left-[50%] top-[10%] h-2 w-2 rotate-45 bg-pink-300/20",
    },
    {
      id: "t-sparkle-4",
      className: "right-[40%] bottom-[12%] h-3 w-3 rotate-45 bg-sky-300/15",
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
            x: [0, index % 2 === 0 ? 20 : -16, 0],
            y: [0, -14, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + index * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// CSS sparkle burst (lightweight celebratory element)
function SparkleBurst() {
  const sparkles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {sparkles.map((i) => {
        const angle = (i / 12) * 360;
        const rad = (angle * Math.PI) / 180;
        const distance = 60 + Math.random() * 40;
        return (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-pink-300"
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0.3,
              x: Math.cos(rad) * distance,
              y: Math.sin(rad) * distance,
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.03 }}
          />
        );
      })}
    </div>
  );
}

const STAGE_DURATIONS = {
  complete: 1500, // Stage 1: "Quest Complete!" beat
  chapter: 2400, // Stage 2: Chapter card display
  exit: 1000, // Stage 3: Fade-out wipe
};

const SAFETY_TIMEOUT = 5000; // Hard fallback to prevent soft-lock

export default function QuestTransition({
  fromLabel = "",
  fromTitle = "",
  toLabel = "",
  toTitle = "",
  onTransitionEnd,
}) {
  const isPrologue = fromLabel === "Prologue";
  // 'complete' → 'chapter' → 'exit' → done
  const [stage, setStage] = useState(isPrologue ? "chapter" : "complete");
  const calledRef = useRef(false);
  const safetyRef = useRef(null);

  // Fire a small confetti burst on mount (Stage 1 celebration)
  useEffect(() => {
    if (!isPrologue) {
      playSfx('whoosh');
      confetti({
        particleCount: 70,
        spread: 65,
        startVelocity: 30,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#f9a8d4", "#7dd3fc", "#fda4af", "#a5b4fc"],
      });
    } else {
      playSfx('whoosh');
    }
  }, [isPrologue]);

  // Safety fallback — guarantee onTransitionEnd fires no matter what
  useEffect(() => {
    safetyRef.current = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onTransitionEnd?.();
      }
    }, SAFETY_TIMEOUT);

    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, [onTransitionEnd]);

  // Stage sequencing via timeouts
  useEffect(() => {
    const durationComplete = isPrologue ? 0 : STAGE_DURATIONS.complete;
    
    const t1 = !isPrologue ? setTimeout(() => setStage("chapter"), durationComplete) : null;
    const t2 = setTimeout(
      () => setStage("exit"),
      durationComplete + STAGE_DURATIONS.chapter,
    );
    const t3 = setTimeout(
      () => {
        if (!calledRef.current) {
          calledRef.current = true;
          onTransitionEnd?.();
        }
      },
      durationComplete + STAGE_DURATIONS.chapter + STAGE_DURATIONS.exit,
    );

    return () => {
      if (t1) clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onTransitionEnd, isPrologue]);

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: stage === "exit" ? 0.5 : 0.35 }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-pink-50 to-fuchsia-100"
        >
          <FloatingDecor />

          {/* ── Stage 1: "Quest Complete!" ── */}
          <AnimatePresence mode="wait">
            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{
                  enter: { type: "spring", stiffness: 260, damping: 18 },
                  exit: { duration: 0.25 },
                }}
                className="relative flex flex-col items-center"
              >
                <SparkleBurst />

                <motion.span
                  className="text-5xl sm:text-6xl drop-shadow-sm select-none"
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  🎉
                </motion.span>

                <motion.h1
                  className="mt-4 text-3xl font-black text-pink-500 sm:text-4xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    type: "spring",
                    stiffness: 200,
                    damping: 16,
                  }}
                >
                  Quest Complete!
                </motion.h1>
              </motion.div>
            )}

            {/* ── Stage 2: Chapter Card ── */}
            {stage === "chapter" && (
              <motion.div
                key="chapter"
                initial={{ y: 40, opacity: 0, scale: 0.92 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -30, opacity: 0, scale: 0.95 }}
                transition={{
                  enter: { type: "spring", stiffness: 220, damping: 20 },
                  exit: { duration: 0.3 },
                }}
                className="flex flex-col items-center px-6 text-center"
              >
                {/* Chapter card */}
                <div className="w-full max-w-sm rounded-3xl border-4 border-pink-200 bg-sky-50/95 p-8 shadow-xl">
                  {/* From → To label transition */}
                  <div className="mb-4 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest">
                    {fromLabel && (
                      <motion.span
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="line-through text-slate-400"
                      >
                        {fromLabel}
                      </motion.span>
                    )}
                    {fromLabel && toLabel && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-pink-400"
                      >
                        →
                      </motion.span>
                    )}
                    {toLabel && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-sky-500 font-black"
                      >
                        {toLabel}
                      </motion.span>
                    )}
                  </div>

                  {/* Big chapter title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 180,
                      damping: 16,
                    }}
                    className="text-2xl font-black text-pink-500 sm:text-3xl"
                  >
                    {toTitle}
                  </motion.h2>

                  {/* Thin decorative divider */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                    className="mx-auto mt-4 h-0.5 w-20 rounded-full bg-pink-200 origin-center"
                  />

                  {/* Subtitle hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 text-sm font-semibold text-slate-400"
                  >
                    {fromTitle && !isPrologue
                      ? `${fromTitle} ✓ — Get ready...`
                      : "Get ready..."}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
