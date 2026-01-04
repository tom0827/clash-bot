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
        const now = new Date().toISOString();
        console.log("Cron job started at: ", now);
        await updateScoresForClan(CLAN_TAG);
        console.log("Cron job completed at:", now);
      } catch (err) {
        console.error("⚠️ Error in scheduled task:", err);
      }
    });

    cron.schedule("*/1 * * * *", async () => {
      setTimeout(async () => {
        try {
          const now = new Date().toISOString();
          console.log("Cron job started at: ", now);
          await updateScoresForClan(CLAN_TAG);
          console.log("Cron job completed at:", now);
        } catch (err) {
          console.error("⚠️ Error in scheduled task:", err);
        }
      }, 30000);
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
