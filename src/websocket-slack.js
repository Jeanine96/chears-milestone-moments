import dotenv from "dotenv";
dotenv.config();
import { App } from "@slack/bolt";

// --- Slack app ---
export const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// --- Start Slack app ---
(async () => {
  try {
    await slackApp.start();
    console.log("Socketmode started");
  } catch (error) {
    console.error("Failed to start Slack app:", error);
  }
})();

// --- Fixed keyword list ---
const keywords = [
  "GEFELICITEERD",
  "JAAR_IN_DIENST",
  "BIER",
  "GOED_BEZIG",
  "VOLTOOID",
  "NIEUWE_COLLEGA"
];

// --- classifyMessage using fixed keywords ---
export function classifyMessage(message) {
  if (!message) return "OTHER";

  const upperText = message.toUpperCase();

  for (const word of keywords) {
    if (upperText.includes(word)) {
      return word; // Return the matched keyword as category
    }
  }

  return "OTHER";
}
