import { DiscordBot } from "./bot/discordBot.js";
import cron from "node-cron";
import { updateScoresForClan } from "./utils/updateScoresHelper.js";
import getDb from "./database/database.js";
const CLAN_TAG = process.env.CLAN_TAG;

const main = async () => {
  console.log("🚀 Starting CoC Discord Bot...");

  try {
    const bot = new DiscordBot();
    await bot.start();
    await getDb();

    cron.schedule("*/1 * * * *", async () => {
      try {
        console.log("🔄 Executing scheduled update for clan scores...");
        await bot.sendMessageToChannel("1438952987849523260", "🔄 Updating clan scores...");
        await updateScoresForClan(CLAN_TAG);
        await bot.sendMessageToChannel("1438952987849523260", "✅ Clan scores updated successfully.");
        console.log("✅ Scheduled update executed successfully.");
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
