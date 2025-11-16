import { DiscordBot } from "./bot/discordBot.js";
import cron from "node-cron";
import { updateScoresForClan } from "./utils/updateScoresHelper.js";
import getDb from "./database/database.js";

const CLAN_TAG = process.env.CLAN_TAG;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const main = async () => {
  console.log("🚀 Starting CoC Discord Bot...");

  try {
    const bot = new DiscordBot();
    await bot.start();
    await getDb();

    cron.schedule("*/1 * * * *", async () => {
      try {
        const now = new Date().toISOString();
        console.log("Cron job started at: ", now);
        await bot.sendMessageToChannel(
          DISCORD_CHANNEL_ID,
          "🔄 Automatic update started at: " + now
        );
        await updateScoresForClan(CLAN_TAG);
        await bot.sendMessageToChannel(
          DISCORD_CHANNEL_ID,
          "✅ Completed at: " + now
        );
        console.log("Cron job completed at:", now);
      } catch (err) {
        console.error("⚠️ Error in scheduled task:", err);
      }
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down bot...");
      await bot.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("\n🛑 Shutting down bot...");
      await bot.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting bot:", error);
    process.exit(1);
  }
};

main();
