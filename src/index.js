/**
 * Discord Bot Entry Point
 * Starts the Discord bot with CoC integration
 */

import dotenv from "dotenv";
dotenv.config();

import { DiscordBot } from "./bot/discordBot.js";

const main = async () => {
  console.log("🚀 Starting CoC Discord Bot...");
  
  try {
    const bot = new DiscordBot();
    await bot.start();
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down bot...');
      await bot.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down bot...');
      await bot.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error("❌ Error starting bot:", error);
    process.exit(1);
  }
};

main();
