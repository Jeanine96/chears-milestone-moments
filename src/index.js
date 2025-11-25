// import { Ticker } from "./ticker.js";
// import { createCanvas, Image, registerFont } from "canvas";
// import fs from "node:fs";
// import path from "node:path";
// import { FPS, LAYOUT } from "./settings.js";
// import { Display } from "@owowagency/flipdot-emu";
// import "./preview.js";
// import "./api-slack.js";
// import { generateImage } from "./image-generation.js";

// const IS_DEV = process.argv.includes("--dev");

// // Create display
// const display = new Display({
//   layout: LAYOUT,
//   panelWidth: 28,
//   isMirrored: true,
//   transport: !IS_DEV
//     ? {
//         type: "serial",
//         path: "/dev/ttyACM0",
//         baudRate: 57600,
//       }
//     : {
//         type: "ip",
//         host: "127.0.0.1",
//         port: 3000,
//       },
// });

// const { width, height } = display;

// // Create output directory if it doesn't exist
// const outputDir = "./output";
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir, { recursive: true });
// }

// // Register fonts
// registerFont(
//   path.resolve(import.meta.dirname, "../fonts/OpenSans-Variable.ttf"),
//   { family: "OpenSans" }
// );
// registerFont(
//   path.resolve(import.meta.dirname, "../fonts/PPNeueMontrealMono-Regular.ttf"),
//   { family: "PPNeueMontreal" }
// );
// registerFont(path.resolve(import.meta.dirname, "../fonts/Px437_ACM_VGA.ttf"), {
//   family: "Px437_ACM_VGA",
// });

// // Create canvas with the specified resolution
// const canvas = createCanvas(width, height);
// const ctx = canvas.getContext("2d");

// // Disable anti-aliasing and image smoothing
// ctx.imageSmoothingEnabled = false;
// // Set a pixel-perfect monospace font
// ctx.font = "18px monospace";
// // Align text precisely to pixel boundaries
// ctx.textBaseline = "top";

// const generatedImage = await generateImage();

// new Image();
// const generatedImageObj = new Image();
// generatedImageObj.src = generatedImage;

// // Initialize the ticker at x frames per second
// const ticker = new Ticker({ fps: FPS });

// ticker.start(async ({ deltaTime, elapsedTime }) => {
//   // Clear the console
//   console.clear();
//   console.log("View at http://localhost:3000/view");

//   // Fill the canvas with a black background
//   ctx.fillStyle = "#000";
//   ctx.fillRect(0, 0, width, height);
//   ctx.drawImage(generatedImageObj, 0, 0, width, height);

//   // Convert image to binary (purely black and white) for flipdot display
//   {
//     const imageData = ctx.getImageData(0, 0, width, height);
//     const data = imageData.data;
//     for (let i = 0; i < data.length; i += 4) {
//       // Apply thresholding - any pixel above 127 brightness becomes white (255), otherwise black (0)
//       const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
//       const binary = brightness > 127 ? 255 : 0;
//       data[i] = binary; // R
//       data[i + 1] = binary; // G
//       data[i + 2] = binary; // B
//       data[i + 3] = 255; // The board is not transparent :-)
//     }
//     ctx.putImageData(imageData, 0, 0);
//   }

//   if (IS_DEV) {
//     // Save the canvas as a PNG file
//     const filename = path.join(outputDir, "frame.png");
//     //display image of DALLE-3
//     const buffer = canvas.toBuffer("image/png");
//     fs.writeFileSync(filename, buffer);
//   } else {
//     const imageData = ctx.getImageData(0, 0, display.width, display.height);
//     display.setImageData(imageData);
//     if (display.isDirty()) {
//       display.flush();
//     }
//   }
//   console.log(`Eslapsed time: ${(elapsedTime / 1000).toFixed(2)}s`);
//   console.log(`Delta time: ${deltaTime.toFixed(2)}ms`);
//   console.timeEnd("Write frame");
// });

import { Ticker } from "./ticker.js";
import { createCanvas, Image, registerFont } from "canvas";
import fs from "node:fs";
import path from "node:path";
import { FPS, LAYOUT } from "./settings.js";
import { Display } from "@owowagency/flipdot-emu";
import "./preview.js";
import "./api-slack.js";
import { generateImage } from "./image-generation.js";

const IS_DEV = process.argv.includes("--dev");

// Create display
const display = new Display({
  layout: LAYOUT,
  panelWidth: 28,
  isMirrored: true,
  transport: !IS_DEV
    ? {
        type: "serial",
        path: "/dev/ttyACM0",
        baudRate: 57600,
      }
    : {
        type: "ip",
        host: "127.0.0.1",
        port: 3000,
      },
});

const { width, height } = display;

// Create output directory
const outputDir = "./output";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Register fonts
registerFont(
  path.resolve(import.meta.dirname, "../fonts/OpenSans-Variable.ttf"),
  { family: "OpenSans" }
);
registerFont(
  path.resolve(import.meta.dirname, "../fonts/PPNeueMontrealMono-Regular.ttf"),
  { family: "PPNeueMontreal" }
);
registerFont(path.resolve(import.meta.dirname, "../fonts/Px437_ACM_VGA.ttf"), {
  family: "Px437_ACM_VGA",
});

// Create canvas
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Disable anti-aliasing
ctx.imageSmoothingEnabled = false;
ctx.font = "18px monospace";
ctx.textBaseline = "top";

const generatedImage = await generateImage();

const generatedImageObj = new Image();
generatedImageObj.src = generatedImage;

// Initialize ticker
const ticker = new Ticker({ fps: FPS });

ticker.start(async ({ deltaTime, elapsedTime }) => {
  console.clear();
  console.log("View at http://localhost:3000/view");

  // Fill the canvas with black
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  //
  // -------------------------------
  //   SCALE IMAGE TO 84 × 28 EXACTLY
  // -------------------------------
  //
  ctx.drawImage(generatedImageObj, 0, 0, width, height);

  //
  // Convert to pure black/white
  //
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const binary = brightness > 127 ? 255 : 0;
    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  //
  // Output
  //
  if (IS_DEV) {
    const filename = path.join(outputDir, "frame.png");
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filename, buffer);
  } else {
    const imageData = ctx.getImageData(0, 0, display.width, display.height);
    display.setImageData(imageData);
    if (display.isDirty()) {
      display.flush();
    }
  }

  console.log(`Elapsed time: ${(elapsedTime / 1000).toFixed(2)}s`);
  console.log(`Delta time: ${deltaTime.toFixed(2)}ms`);
  console.timeEnd("Write frame");
});
