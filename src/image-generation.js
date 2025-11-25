import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import fs from "fs";
import { getSlackMessage } from "./api-slack.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function generateImage() {
  const message = await getSlackMessage();
  console.log("Generating image with message:", message);
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `Create a strictly black-and-white pixel-art image at exactly 84×28 pixels, ensuring the entire composition fits perfectly within this resolution with no cropping, no scaling, and no empty margins beyond the defined canvas. Optimize every element for flip-dot display clarity, using only pure black and pure white pixels (no grayscale, dithering, or anti-aliasing). Depict a simple birthday-celebration theme using extremely minimalistic balloons or confetti made from clear geometric shapes that remain recognizable at very small sizes. Center the text ‘${message}’ in thick, monospaced, high-contrast block lettering designed for maximum legibility on low-resolution flip-dot hardware. Maintain strong visual balance, generous spacing between characters and decorative elements, and an uncluttered overall layout to ensure everything is readable and visually stable on an actual flip-dot board`,
    size: "1536x1024",
    n: 1,
  });

  // DALL·E returns base64-encoded image data:
  const image_base64 = result.data[0].b64_json;
  const image_bytes = Buffer.from(image_base64, "base64");
  fs.writeFileSync("image.png", image_bytes);
  return image_bytes;
}

// // generateImage();
// // console.log(generateImage());
// generateImage().then(() => {
//   console.log("Done.");
// });
