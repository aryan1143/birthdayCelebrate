import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";

export default function QuestIntroModal({
  questTitle,
  instructions = [],
  onClose,
  isOpen,
}) {
  const [lineIndex, setLineIndex] = useState(0);

  // Reset dialogue sequence when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setLineIndex(0);
    }
  }, [isOpen]);

  const fullText = instructions[lineIndex] || "";

  // Use the extracted hook
  const { displayedText, isComplete, skip } = useTypewriter({
    text: fullText,
    speed: 38,
    isActive: isOpen,
  });

  const handleInteraction = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!isComplete) {
      // Click-to-skip: instantly complete current line
      skip();
    } else if (lineIndex < instructions.length - 1) {
      // Advance to the next line
      setLineIndex((prev) => prev + 1);
    } else {
      // Exit modal after last line
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-xs select-none"
          onClick={handleInteraction}
        >
          {/* Dialogue Box Card */}
          <motion.div
            initial={{ scale: 0.85, y: 60, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              transition: { type: "spring", stiffness: 260, damping: 20 },
            }}
            exit={{
              scale: 0.85,
              y: 40,
              opacity: 0,
              transition: { duration: 0.15 },
            }}
            onClick={handleInteraction}
            className="relative flex w-full max-w-md cursor-pointer flex-col items-start rounded-3xl border-4 border-pink-200 bg-sky-50/95 p-6 shadow-xl md:p-8"
          >
            {/* Quest Title */}
            <h2 className="text-xl font-black leading-normal tracking-wide text-pink-500 md:text-2xl">
              {questTitle}
            </h2>

            {/* Narration Text Box */}
            <div className="mt-4 min-h-[90px] w-full px-1 text-left text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
              <span>{displayedText}</span>
              {isComplete && (
                <motion.span
                  initial={{ y: 0 }}
                  animate={{ y: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                  className="ml-2 inline-block text-xs text-pink-400 select-none font-bold"
                >
                  ▼
                </motion.span>
              )}
            </div>

            {/* Navigation Button */}
            <div className="mt-2 flex w-full justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInteraction}
                className="rounded-2xl bg-pink-400 hover:bg-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                {lineIndex === instructions.length - 1
                  ? "Start Quest :3"
                  : "Next ➜"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
