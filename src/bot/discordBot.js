/**
 * Discord Bot Client
 * Handles Discord bot initialization and command registration
 */

import { Client, GatewayIntentBits } from "discord.js";
import { CocBot } from "./cocBot.js";
import { CommandHandler } from "./handlers/commandHandler.js";
import { EmbedBuilderService } from "./builders/embedBuilder.js";
import { Commands } from "./commands/commands.js";

export class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.cocBot = new CocBot();
    this.embedBuilder = new EmbedBuilderService();
    this.commandHandler = new CommandHandler(this.cocBot, this.embedBuilder);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once("ready", () => {
      console.log(
        `✅ Discord bot is ready! Logged in as ${this.client.user.tag}`
      );
    });

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        await this.commandHandler.handleCommand(interaction);
      } catch (error) {
        console.error("Error handling command:", error);
        const errorMessage = "There was an error executing this command!";

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: errorMessage,
            ephemeral: true,
          });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });
  }

  getCommands() {
    return Commands.getCommands();
  }

  async start() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error("DISCORD_BOT_TOKEN is not set in the environment");
    }

    await this.client.login(token);
  }

  async stop() {
    await this.client.destroy();
  }
}
