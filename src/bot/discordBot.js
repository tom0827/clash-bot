/**
 * Discord Bot Client
 * Handles Discord bot initialization and command registration
 */

import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { CocBot } from "./cocBot.js";

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
    this.setupEventHandlers();
    this.CHUNK_SIZE = 10;
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
        await this.handleCommand(interaction);
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

  async handleCommand(interaction) {
    const { commandName } = interaction;

    switch (commandName) {
      case "donation-scores":
        await this.handleDonationScoresCommand(interaction);
        break;
      case "raid-scores":
        await this.handleRaidScoresCommand(interaction);
        break;
      case "cwl-scores":
        await this.handleCwlScoresCommand(interaction);
        break;
      case "help":
        await this.handleHelpCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: "Unknown command!",
          ephemeral: true,
        });
    }
  }

  async handleDonationScoresCommand(interaction) {
    const clanTag = process.env.CLAN_TAG;

    if (!clanTag) {
      await interaction.reply({
        content: "Error: CLAN_TAG not configured in environment variables.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await this.cocBot.handleDonationScoresCommand(clanTag);

      if (typeof result === "string" && result.startsWith("Error")) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.createDonationScoreEmbed(result);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleRaidScoresCommand(interaction) {
    const clanTag = process.env.CLAN_TAG;

    if (!clanTag) {
      await interaction.reply({
        content: "Error: CLAN_TAG not configured in environment variables.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await this.cocBot.handleRaidScoresCommand(clanTag);

      if (typeof result === "string" && result.startsWith("Error")) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.createRaidScoreEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleCwlScoresCommand(interaction) {
    const clanTag = process.env.CLAN_TAG;

    if (!clanTag) {
      await interaction.reply({
        content: "Error: CLAN_TAG not configured in environment variables.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await this.cocBot.handleCWLScoresCommand(clanTag);

      if (typeof result === "string" && result.startsWith("Error")) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.createCWLScoreEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleHelpCommand(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🏰 CoC Bot Commands")
      .setDescription("Clash of Clans clan participation scoring bot")
      .addFields(
        {
          name: "/donation-scores",
          value: "Get donation scores for all clan members",
          inline: false,
        },
        {
          name: "/raid-scores",
          value: "Get capital raid scores for all clan members",
          inline: false,
        },
        {
          name: "/war-scores",
          value: "Get war league scores for all clan members",
          inline: false,
        },
        {
          name: "/help",
          value: "Show this help message",
          inline: false,
        }
      )
      .addFields({
        name: "📊 Scoring System",
        value:
          "Donations: 500+ (3pts), 2500+ (5pts), 5000+ (7pts), 7500+ (10pts), 10000+ (15pts)\nCapital Raids: 10k+ (1pt), 15k+ (2pts), 20k+ (3pts), 25k+ (5pts)\nWar League: Perfect stars (30pts), 2+ avg stars with high destruction (15-25pts)",
        inline: false,
      })
      .setFooter({
        text: "Commands use the configured clan from CLAN_TAG environment variable",
      });

    await interaction.reply({ embeds: [embed] });
  }

  createDonationScoreEmbed(scoreData) {
    const embed = new EmbedBuilder()
      .setColor("#ffa500")
      .setTitle("💰 Donation Scores")
      .setTimestamp();

    if (scoreData.length > 0) {
      for (let i = 0; i < scoreData.length; i += this.CHUNK_SIZE) {
        const chunk = scoreData.slice(i, i + this.CHUNK_SIZE);
        let donationScores = chunk
          .map(
            (player, index) =>
              `${i + index + 1}. **${
                player.name
              }**: ${player.donations.toLocaleString()} donations (${
                player.score
              } pts)`
          )
          .join("\n");

        embed.addFields({
          name: `📊 Players ${i + 1} - ${i + chunk.length}`,
          value: donationScores,
          inline: false,
        });
      }
    } else {
      embed.addFields({
        name: "📊 Status",
        value: "No donation data available",
        inline: false,
      });
    }

    return embed;
  }

  createRaidScoreEmbed(scoreData) {
    const embed = new EmbedBuilder()
      .setColor("#8B4513")
      .setTitle("🏛️ Capital Raid Scores")
      .setTimestamp();

    if (scoreData.length > 0) {
      for (let i = 0; i < scoreData.length; i += this.CHUNK_SIZE) {
        const chunk = scoreData.slice(i, i + this.CHUNK_SIZE);
        let raidScores = chunk
          .map(
            (player, idx) =>
              `${i + idx + 1}. **${
                player.name
              }**: ${player.capitalResourcesLooted.toLocaleString()} gold (${
                player.score
              } pts)`
          )
          .join("\n");

        embed.addFields({
          name: `📊 Players ${i + 1} - ${i + chunk.length}`,
          value: raidScores,
          inline: false,
        });
      }
    } else {
      embed.addFields({
        name: "📊 Status",
        value: "No capital raid data available",
        inline: false,
      });
    }

    return embed;
  }

  createCWLScoreEmbed(scoreData) {
    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("⚔️ War League Scores")
      .setTimestamp();

    if (scoreData.length > 0) {
      for (let i = 0; i < scoreData.length; i += this.CHUNK_SIZE) {
        const chunk = scoreData.slice(i, i + this.CHUNK_SIZE);
        let warScores = chunk
          .map(
            (player, idx) =>
              `${i + idx + 1}. **${player.name}**: ${player.totalStars}⭐ AVG: ${
                player.averageStars
              } (${player.score} pts)`
          )
          .join("\n");

        embed.addFields({
          name: `📊 Players ${i + 1} - ${i + chunk.length}`,
          value: warScores,
          inline: false,
        });
      }
    } else {
      embed.addFields({
        name: "📊 Status",
        value: "No war league data available",
        inline: false,
      });
    }

    return embed;
  }

  getCommands() {
    return [
      new SlashCommandBuilder()
        .setName("donation-scores")
        .setDescription("Get donation scores for all clan members"),

      new SlashCommandBuilder()
        .setName("raid-scores")
        .setDescription("Get capital raid scores for all clan members"),

      new SlashCommandBuilder()
        .setName("cwl-scores")
        .setDescription("Get clan war league scores for all clan members"),

      new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show help information and commands"),
    ];
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
