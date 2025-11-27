import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import fs from "fs";
import { getSlackMessage } from "./api-slack.js";
import { Console } from "console";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Prompt Builders (full Slack message included)

function verjaardagPrompt(fullMessage) {
  return `
Create a strictly black-and-white pixel-art image at exactly 84×28 pixels, ensuring the entire composition fits perfectly within this resolution with no cropping, no scaling, and no empty margins beyond the defined canvas. Optimize every element for flip-dot display clarity, using only pure black and pure white pixels (no grayscale, dithering, or anti-aliasing). Depict a simple birthday-celebration theme using extremely minimalistic birthday elements made from clear geometric shapes that remain recognizable at very small sizes. Center the text ‘${fullMessage}’ in thick, monospaced, high-contrast block lettering designed for maximum legibility on low-resolution flip-dot hardware. Maintain strong visual balance, generous spacing between characters and decorative elements, and an uncluttered overall layout to ensure everything is readable and visually stable on an actual flip-dot board.`;
}

function dienstPrompt(fullMessage) {
  return `
Create a black-and-white pixel-art image at exactly 84×28 pixels, using only pure black and pure white pixels. No cropping, scaling, margins, grayscale, dithering, or anti-aliasing. Theme: professional work birthday celebration, with minimalist geometric elements like balloons, confetti, streamers, coffee mugs, laptops, or party hats on desks. Center the text ${fullMessage} in thick, high-contrast, monospaced block letters, optimized for maximum legibility on low-resolution flip-dot displays. Keep strong visual balance, generous spacing, and an uncluttered layout. Randomly include two decorative elements per image from birthday or work-themed items.
`;
}

function fallbackPrompt(fullMessage) {
  return `
Create a neutral black-and-white pixel-art image at exactly 84×28 pixels.
Use only pure black and pure white pixels.

Center ALL of the following Slack message text clearly:
"${fullMessage}"

Include minimal geometric decoration.
`;
}

// GPT Subject Detector

async function detectSubjectWithGPT(message, openai) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
        Classify the topic of this message.
        Return only ONE word:
        - "VERJAARDAG" → birthday
        - "DIENST" → WORK ANNIVERSARY / YEARS EMPLOYED
        - "OTHER" → ANYTHING ELSE
      `,
      },
      {
        role: "user",
        content: message,
      },
    ],
    max_tokens: 5,
  });

  return response.choices[0].message.content.trim().toUpperCase();
}

// Main Image Generator

export async function generateImage() {
  const slackMessage = await getSlackMessage(); // FULL message from Slack
  console.log("Slack message:", slackMessage);

  // Detect subject using GPT
  const subject = await detectSubjectWithGPT(slackMessage, openai);
  console.log("Detected subject:", subject);

  // Build final prompt containing the entire Slack message
  let prompt;

  if (subject === "BIRTHDAY" || subject === "VERJAARDAG") {
    prompt = verjaardagPrompt(slackMessage);
    console.log("Using verjaardag prompt.", verjaardagPrompt(slackMessage));
  } else if (subject === "DIENST" || subject === "WORK ANNIVERSARY") {
    prompt = dienstPrompt(slackMessage);
  } else {
    prompt = fallbackPrompt(slackMessage);
    console.log("Using fallback prompt.", fallbackPrompt(slackMessage));
  }

  // Generate the image
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
    n: 1,
  });

  const img = result.data[0].b64_json;
  const buffer = Buffer.from(img, "base64");

  fs.writeFileSync("image.png", buffer);
  console.log("Image saved as image.png");

  return buffer;
}
