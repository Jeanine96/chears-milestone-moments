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
    prompt: `Create a strictly black-and-white pixel-art image at exactly 84×28 pixels. Use only pure black and pure white pixels—no grayscale, dithering, or anti-aliasing. Depict a birthday theme using simple, bold, geometric shapes for balloons, confetti, cakes, or candles, optimized to be clearly recognizable at very small sizes. Center the text '${message}' in thick, high-contrast monospaced block letters that are fully legible on low-resolution flip-dot displays. Maintain strong visual balance and generous spacing between letters and decorative elements. Randomly select two large, clearly defined birthday elements per generation, making sure they do not overlap the text and are easily distinguishable from the background`,
    size: "1536x1024",
    n: 1,
  });

  // DALL·E returns base64-encoded image data:
  const image_base64 = result.data[0].b64_json;
  const image_bytes = Buffer.from(image_base64, "base64");
  fs.writeFileSync("image.png", image_bytes);
  return image_bytes;
}
