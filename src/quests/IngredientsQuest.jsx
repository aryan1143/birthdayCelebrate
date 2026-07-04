/**
 * TUNE THIS FILE when the real kitchen.png arrives.
 *
 * Update the background image from `kitchen.png` (or whatever the real asset is called)
 * so it fits exactly within the `max-w-3xl` container without weird stretching.
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import QuestIntroModal from "../components/QuestIntroModal";
import { questNarration } from "../data/questNarration";
import { INITIAL_KITCHEN_INGREDIENTS } from "../data/kitchenIngredients";
import { KITCHEN_GRID, GRID_COLS, GRID_ROWS } from "../data/kitchenGrid";
import { findPath } from "../utils/pathfinding";
import KitchenSlime from "../components/KitchenSlime";
import kitchenImage from "../assets/kitchen.png";
import backgroundImage from "../assets/background.jpg"; // Using background for the page outside kitchen

import { playSfx } from "../utils/soundManager";

export default function IngredientsQuest({ onComplete }) {
  const { quest3Completed, setQuest3Completed, setIngredients } = useGame();
  const [showIntro, setShowIntro] = useState(true);
  const [showGridDebug, setShowGridDebug] = useState(false); // Toggle for tuning
  const [ingredientsState, setIngredientsState] = useState(
    INITIAL_KITCHEN_INGREDIENTS,
  );
  const [slimePos, setSlimePos] = useState({ col: 5, row: 8 }); // Start bottom-centerish
  const [activePath, setActivePath] = useState([]);

  const containerRef = useRef(null);

  const collectedCount = ingredientsState.filter((i) => i.collected).length;
  const totalCount = ingredientsState.length;
  const isFinished = collectedCount === totalCount;

  // Check if all collected
  useEffect(() => {
    if (isFinished && !quest3Completed) {
      setQuest3Completed(true);
      setIngredients(ingredientsState.map((i) => i.id));
    }
  }, [
    isFinished,
    quest3Completed,
    ingredientsState,
    setIngredients,
    setQuest3Completed,
  ]);

  const handleKitchenTap = (e) => {
    if (showIntro || isFinished) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate cell sizes based on ACTUAL rendered size (responsive)
    const dynamicCellWidth = rect.width / GRID_COLS;
    const dynamicCellHeight = rect.height / GRID_ROWS;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const targetCell = {
      col: Math.max(
        0,
        Math.min(GRID_COLS - 1, Math.floor(x / dynamicCellWidth)),
      ),
      row: Math.max(
        0,
        Math.min(GRID_ROWS - 1, Math.floor(y / dynamicCellHeight)),
      ),
    };

    // Determine where slime currently is (end of current path, or its exact pos if idle)
    const startPos =
      activePath.length > 0 ? activePath[activePath.length - 1] : slimePos;

    const newPath = findPath(
      startPos.col,
      startPos.row,
      targetCell.col,
      targetCell.row,
    );

    // Append new path to existing path if already moving
    setActivePath((prev) => [...prev, ...newPath]);
  };

  const handleSlimeStep = (nextCell) => {
    playSfx('hop'); // Throttled internally if needed, but safe to call
    setSlimePos(nextCell);

    // Check ingredient proximity (same cell, or immediately adjacent)
    setIngredientsState((prev) => {
      let collectedAny = false;
      const nextState = prev.map((ing) => {
        if (ing.collected) return ing;

        const distCol = Math.abs(ing.col - nextCell.col);
        const distRow = Math.abs(ing.row - nextCell.row);

        if (distCol <= 1 && distRow <= 1) {
          collectedAny = true;
          return { ...ing, collected: true };
        }
        return ing;
      });

      if (collectedAny) {
        playSfx('pop');
      }
      return nextState;
    });
  };

  const handlePathComplete = () => {
    setActivePath([]);
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-white/25"
        aria-hidden="true"
      />

      <div
        className={`w-full max-w-[500px] flex flex-col items-center px-4 py-4 pt-6 transition-all duration-300 ${
          showIntro
            ? "pointer-events-none select-none blur-[2px] brightness-90"
            : ""
        }`}
      >
        <header className="relative mb-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Quest 3
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-normal text-slate-800 sm:text-4xl">
            The Kitchen Hunt
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Tap anywhere to make Rimuru hop around!
          </p>

        </header>

        {/* Progress Tracker */}
        <div className="relative mb-4 w-full">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Ingredients Gathered</span>
            <span className="font-bold text-pink-500">
              {collectedCount} / {totalCount} Found
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-pink-400"
              initial={{ width: 0 }}
              animate={{ width: `${(collectedCount / totalCount) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
        </div>

        {/* Playable Kitchen Area */}
        <div
          className="relative w-full aspect-square overflow-hidden rounded-[2rem] border-4 border-pink-200 bg-sky-50 shadow-xl cursor-pointer select-none"
          onClick={handleKitchenTap}
        >
          {/* Fully responsive 1:1 container */}
          <div
            ref={containerRef}
            className="relative w-full h-full bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${kitchenImage})` }}
          >
            {/* Grid Debug Overlay */}
            {showGridDebug && (
              <div className="absolute inset-0 pointer-events-none flex flex-wrap w-full h-full">
                {KITCHEN_GRID.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{
                        width: `${100 / GRID_COLS}%`,
                        height: `${100 / GRID_ROWS}%`,
                      }}
                      className={`border border-white/20 flex items-center justify-center text-[10px] text-white/50 ${
                        cell === 1 ? "bg-red-500/30" : "bg-green-500/10"
                      }`}
                    >
                      {cIdx},{rIdx}
                    </div>
                  )),
                )}
              </div>
            )}

            {/* Ingredients Rendering */}
            <AnimatePresence>
              {ingredientsState.map((ing) => {
                if (ing.collected) return null; // Unmount when collected
                return (
                  <motion.div
                    key={ing.id}
                    className="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${(ing.col + 0.5) * (100 / GRID_COLS)}%`,
                      top: `${(ing.row + 0.5) * (100 / GRID_ROWS)}%`,
                      width: `${100 / GRID_COLS}%`,
                      height: `${100 / GRID_ROWS}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: 1,
                      y: [0, -4, 0], // Gentle bob
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                      y: -20,
                      transition: { duration: 0.3 },
                    }}
                    transition={{
                      scale: { duration: 0.3 },
                      opacity: { duration: 0.3 },
                      y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    }}
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-sm">
                      {ing.emoji}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pathfinding Slime */}
            <KitchenSlime
              col={slimePos.col}
              row={slimePos.row}
              path={activePath}
              onPathComplete={handlePathComplete}
              onStep={handleSlimeStep}
            />
          </div>
        </div>

        {/* Quest Complete Dialogue */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="pointer-events-auto absolute left-1/2 top-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border-4 border-pink-200 bg-sky-50/95 p-6 text-center shadow-2xl backdrop-blur-sm"
            >
              <p className="font-semibold leading-relaxed text-slate-600 text-sm md:text-base">
                &quot;We got everything! Now let's head to the cake... 🎉&quot;
              </p>

              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="mt-4 rounded-2xl bg-pink-400 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-pink-500"
              >
                Continue Quest ➔
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuestIntroModal
        questTitle={questNarration.ingredients.title}
        instructions={questNarration.ingredients.instructions}
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
      />
    </div>
  );
}
