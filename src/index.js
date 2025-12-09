import { Ticker } from "./ticker.js";
import { createCanvas, registerFont } from "canvas";
import fs from "node:fs";
import path from "node:path";
import { FPS, LAYOUT } from "./settings.js";
import { Display } from "@owowagency/flipdot-emu";
import "./preview.js";
import { slackApp } from "./websocket-slack.js";
import dotenv from "dotenv";
import { wordsToAnimations } from "./animation.js";
import { keywords } from "./websocket-slack.js";

dotenv.config();

const IS_DEV = process.argv.includes("--dev");

// --- Display Setup ---
const display = new Display({
  layout: LAYOUT,
  panelWidth: 28,
  isMirrored: true,
  transport: !IS_DEV
    ? { type: "serial", path: "/dev/ttyACM0", baudRate: 57600 }
    : { type: "ip", host: "127.0.0.1", port: 3000 },
});

const { width, height } = display;

// Output folder
const outputDir = "./output";
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Register fonts
registerFont(path.resolve(import.meta.dirname, "../fonts/OpenSans-Variable.ttf"), { family: "OpenSans" });
registerFont(path.resolve(import.meta.dirname, "../fonts/PPNeueMontrealMono-Regular.ttf"), { family: "PPNeueMontreal" });
registerFont(path.resolve(import.meta.dirname, "../fonts/Px437_ACM_VGA.ttf"), { family: "Px437_ACM_VGA" });

// Canvas
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

function detectAnimation(word) {
  const lower = word.toLowerCase();
  for (const keyword of Object.keys(wordsToAnimations)) {
    if (lower.includes(keyword)) {
      console.log(`Detected animation keyword: ${keyword}`);
      return wordsToAnimations[keyword];
    }
  }
  return null;
}

// Convert canvas to black & white
function toBlackAndWhite(ctx) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const binary = brightness > 127 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = binary;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

// Render frame
function renderFrame() {
  if (IS_DEV) {
    const filename = path.join(outputDir, "frame.png");
    fs.writeFileSync(filename, canvas.toBuffer("image/png"));
  } else {
    display.setImageData(ctx.getImageData(0, 0, width, height));
    if (display.isDirty()) display.flush();
  }
}

// --- Play animation ---
function playAnimation(animationFrames) {
  if (!animationFrames) return;

  const frames = Object.values(animationFrames);
  const loops = 3;
  let loopCount = 0;
  let frameIndex = 0;

  return new Promise((resolve) => {
    const ticker = new Ticker({ fps: FPS / 7 });
    ticker.start(() => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      const frame = frames[frameIndex];
      for (let y = 0; y < frame.length; y++) {
        for (let x = 0; x < frame[y].length; x++) {
          if (frame[y][x]) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      renderFrame();

      frameIndex++;
      if (frameIndex >= frames.length) {
        frameIndex = 0;
        loopCount++;
        if (loopCount >= loops) ticker.stop(), resolve();
      }
    });
  });
}

// --- Start ticker (scrolling text) ---
function startTicker(message, chosenAnimation) {
  let textX = width;
  let cyclesCompleted = 0;
  const maxCycles = 1;
  const speed = 2;
  const textWidth = ctx.measureText(message).width + 20;

  return new Promise((resolve) => {
    const ticker = new Ticker({ fps: FPS });
    ticker.start(() => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#fff";
      ctx.font = '12px "OpenSans" bold';
      ctx.fillText(message, textX, 18);
      ctx.fillText(message, textX + textWidth, 18);

      textX -= speed;

      if (textX <= -textWidth) {
        textX += textWidth;
        cyclesCompleted++;
        if (cyclesCompleted >= maxCycles) {
          ticker.stop();
          playAnimation(chosenAnimation).then(resolve);
          return;
        }
      }

      toBlackAndWhite(ctx);
      renderFrame();
    });
  });
}

// --- Message Queue ---
const messageQueue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || messageQueue.length === 0) return;
  isProcessing = true;

  const { message, animation } = messageQueue.shift();
  await startTicker(message, animation);

  isProcessing = false;
  processQueue();
}

// Keyword classifier
export function classifyMessage(message) {
  if (!message) return "";

  const upperText = message.toUpperCase();
  for (const word of keywords) {
    if (upperText.includes(word)) {
      return word;
    }
  }
  return "";
}

// --- Handle Slack messages ---
const channelId = process.env.CHANNEL_ID;

slackApp.message(async ({ message: slackMessage }) => {
  if (!slackMessage.text) return;
  if (slackMessage.channel !== channelId) return;

  const text = slackMessage.text;

  // Filter using your keyword list
  const category = classifyMessage(text);
  if (!category) {
    console.log("Filtered out (no keyword match):", text);
    return;
  }

  const chosenAnimation = detectAnimation(text);

  console.log("Queued message:", text, "Category:", category);
  messageQueue.push({ message: text, animation: chosenAnimation });
  processQueue();
});

slackApp;

