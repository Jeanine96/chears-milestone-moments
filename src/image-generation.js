import dotenv from "dotenv";
dotenv.config();

// const openai = process.env.OPENAI_KEY;

// export async function generateImage(prompt) {
//   try {
//     const response = await openai.images.generate({
//       model: "gpt-image-1",
//       prompt: prompt,
//       size: "1024x1024",
//       n: 1,
//     });
//     const imageBuffer = Buffer.from(response.data[0].b64_json, "base64");
//     await writeFile("output.png", imageBuffer);
//     console.log(imageBuffer);
//   } catch (error) {
//     console.error("Error generating image:", error);
//   }
// }
// // Example usage
// generateImage(
//   "Birthday celebration with balloons or confetti with the text 'Happy Birthday!' in the image in black and white in a pixelart style suitable for a flip dot board"
// );

import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function generateImage() {
  // Call the images API
  const result = await openai.images.generate({
    model: "gpt-image-1", // DALL·E 3
    prompt:
      "Birthday celebration with balloons or confetti with the text 'Happy Birthday!' in the image in black and white in a pixelart style suitable for a flip dot board",
    size: "1024x1024",
    n: 1,
  });

  // DALL·E returns base64-encoded image data:
  const image_base64 = result.data[0].b64_json;
  const image_bytes = Buffer.from(image_base64, "base64");

  // Save output
  fs.writeFileSync("image.png", image_bytes);
  console.log("image_bytes:", image_bytes);
  console.log("Image saved as image.png");
}

generateImage();
