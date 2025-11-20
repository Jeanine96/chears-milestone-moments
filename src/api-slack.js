import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch"; // Only if Node <18

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
    // prevent too many requests to the api
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") || 1;
      // console.warn(`Rate limited. Retry after ${retryAfter} seconds.`);
      await new Promise((res) => setTimeout(res, retryAfter * 2000));
      return getSlackMessage(); // retry after waiting
    }

    const data = await response.json();

    if (!data.ok) {
      console.error("Error fetching messages:", data.error);
      return "";
    }

    const latestMessage = data.messages[0]?.text || "";
    const words = ["birthday", "verjaardag"];
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
