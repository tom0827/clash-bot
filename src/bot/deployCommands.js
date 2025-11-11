/**
 * Command Deployment Script
 * Registers slash commands with Discord
 */

import { REST, Routes } from 'discord.js';
import { DiscordBot } from './discordBot.js';
import dotenv from 'dotenv';

dotenv.config();

const deployCommands = async () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in environment variables');
    process.exit(1);
  }

  const bot = new DiscordBot();
  const commands = bot.getCommands().map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');

    if (guildId) {
      // Deploy to specific guild (faster for testing)
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`Successfully reloaded ${commands.length} guild commands.`);
    } else {
      // Deploy globally (takes up to 1 hour to sync)
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`Successfully reloaded ${commands.length} global commands.`);
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
};

deployCommands();