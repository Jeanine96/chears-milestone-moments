import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

export async function getSlackMessage() {
  try {
    const response = await fetch(
      `https://slack.com/api/conversations.history?channel=${channelId}&limit=1&inclusive=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      [channelId]
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("Error fetching messages:", data.error);
      return "";
    }

    const latestMessage = data.messages[0]?.text || "";
    const words = ["birthday", "verjaardag", "jarig"];
    const latestAnnouncement = String(latestMessage).toLocaleLowerCase();

    for (let i = 0; i < words.length; i++) {
      if (latestAnnouncement.includes(words[i])) {
        return latestAnnouncement;
      }
    }

    return "";
  } catch (error) {
    console.error("Error:", error);
    return "";
  }
}
