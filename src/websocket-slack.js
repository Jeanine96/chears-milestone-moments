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
export const keywords = [
  "GEFELICITEERD",
  "JAAR_IN_DIENST",
  "BIER",
  "GOED_BEZIG",
  "VOLTOOID",
  "NIEUWE_COLLEGA"
];
