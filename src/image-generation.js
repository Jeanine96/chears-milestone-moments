import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function generateImage(message) {
  const prompt = `Birthday celebration with ballons or confetti ${message}`;
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt:
      "Birthday celebration with balloons or confetti with the text 'Happy Birthday!' in the image in black and white in a pixelart style suitable for a flip dot board",
    size: "1024x1024",
    n: 1,
  });

  // DALL·E returns base64-encoded image data:
  const image_base64 = result.data[0].b64_json;
  const image_bytes = Buffer.from(image_base64, "base64");
  fs.writeFileSync("image.png", image_bytes);
  return image_bytes;
}

generateImage();
console.log(generateImage());
