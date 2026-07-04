/**
 * Helper to dynamically create a beautiful placeholder image as a Base64 Data URL.
 * It draws a soft pink/blue gradient, minor grid details, a birthday cake emoji,
 * and bold "HAPPY BIRTHDAY!" text so the puzzle has a complete image on start.
 */
import image from "./mualani.jpg";

export function generatePlaceholderImage() {
  // Check if we are running in a browser environment
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Create smooth diagonal gradient (matching bluish/pinkish theme)
  const gradient = ctx.createLinearGradient(0, 0, 600, 600);
  gradient.addColorStop(0, "#e0f2fe"); // sky-100 (light blue)
  gradient.addColorStop(0.5, "#fae8ff"); // fuchsia-100 (soft pastel purple)
  gradient.addColorStop(1, "#fbcfe8"); // pink-200 (light pink)
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 600);

  // Draw a cute dashed grid pattern in the background
  ctx.strokeStyle = "rgba(236, 72, 153, 0.08)"; // pink-500 with low opacity
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  for (let i = 100; i < 600; i += 100) {
    // vertical
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 600);
    ctx.stroke();
    // horizontal
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(600, i);
    ctx.stroke();
  }
  ctx.setLineDash([]); // reset

  // Draw outer soft border
  ctx.strokeStyle = "#f472b6"; // pink-400
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 584, 584);

  // Draw inner thin border
  ctx.strokeStyle = "#38bdf8"; // sky-400
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 552, 552);

  // Centered birthday cake emoji
  ctx.font = "140px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎂", 300, 250);

  // Celebratory birthday text
  ctx.fillStyle = "#db2777"; // pink-600 (retro-cute bold color)
  ctx.font = "black 42px sans-serif";
  // Draw soft text shadow
  ctx.shadowColor = "rgba(219, 39, 119, 0.15)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText("HAPPY BIRTHDAY!", 300, 410);

  // Subtitle
  ctx.shadowColor = "transparent"; // reset shadow
  ctx.fillStyle = "#0284c7"; // sky-600
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("PEACE THE MEMORY TOGETHER", 300, 470);

  return canvas.toDataURL();
}

// TODO: Replace with absolute path/URI to a real photo or artwork image file (e.g., "/src/assets/puzzle_photo.jpg")
const REAL_IMAGE_SRC = image;

export const puzzleConfig = {
  imageSrc: REAL_IMAGE_SRC || generatePlaceholderImage(),
  gridSize: 3, // 3 means 3x3 = 9 pieces. Can be changed to 4, 5, etc.
};
