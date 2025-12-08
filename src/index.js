import { Ticker } from "./ticker.js";
import { createCanvas, registerFont } from "canvas";
import fs from "node:fs";
import path from "node:path";
import { FPS, LAYOUT } from "./settings.js";
import { Display } from "@owowagency/flipdot-emu";
import "./preview.js";
import "./api-slack.js";
import { getSlackMessage } from "./api-slack.js";

// Import animations
import { birthdayAnimation } from "./animations/birthday-animation.js";
import { beerAnimation } from "./animations/time-for-beer.js";   
import { weRockAnimation } from "./animations/we-rock-animation.js";
import { welcomeToTeamAnimation } from "./animations/welcome-to-team.js";

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

// Get the Slack message
const slackMessage = await getSlackMessage();

// Animation registry
const animations = {
  gefeliciteerd: birthdayAnimation,
  bier: beerAnimation,
  voltooid: weRockAnimation,
  collega: welcomeToTeamAnimation
};

// Detect which animation to use
function detectAnimation(message) {
  const lower = message.toLowerCase();
  for (const keyword of Object.keys(animations)) {
    if (lower.includes(keyword)) {
      console.log(`Detected animation keyword: ${keyword}`);
      return animations[keyword];
    }
  }
  return null;
}

const chosenAnimation = detectAnimation(slackMessage);

// Text scrolling variables
let textX = width;
let cyclesCompleted = 0;
const maxCycles = 1;
const speed = 2;

ctx.font = '12px "OpenSans" bold';
const textWidth = ctx.measureText(slackMessage).width + 20;

// Helper to convert canvas to black & white
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

// Draw frame to display or save
function renderFrame() {
  if (IS_DEV) {
    const filename = path.join(outputDir, "frame.png");
    fs.writeFileSync(filename, canvas.toBuffer("image/png"));
  } else {
    display.setImageData(ctx.getImageData(0, 0, width, height));
    if (display.isDirty()) display.flush();
  }
}

// Generic animation runner
function playAnimation(animationFrames) {
  if (!animationFrames) {
    console.log("No animation selected — ending program.");
    return;
  }

  const frames = Object.values(animationFrames);
  const loops = 5;
  let loopCount = 0;
  let frameIndex = 0;

  const ticker = new Ticker({ fps: FPS / 7 });

  ticker.start(() => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const frame = frames[frameIndex];

    // draw 1 pixel per point
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

      if (loopCount >= loops) {
        ticker.stop();
      }
    }
  });
}

// Start scrolling ticker
function startTicker() {
  const ticker = new Ticker({ fps: FPS });

  ticker.start(() => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#fff";
    ctx.font = '12px "OpenSans" bold';

    ctx.fillText(slackMessage, textX, 18);
    ctx.fillText(slackMessage, textX + textWidth, 18);

    textX -= speed;

    if (textX <= -textWidth) {
      textX += textWidth;
      cyclesCompleted++;

      if (cyclesCompleted >= maxCycles) {
        ticker.stop();
        playAnimation(chosenAnimation);
        return;
      }
    }

    toBlackAndWhite(ctx);
    renderFrame();
  });
}

startTicker();

