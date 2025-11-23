/**
 * Command Definitions
 * Defines all slash commands for the Discord bot
 */

import { SlashCommandBuilder } from "discord.js";

export class Commands {
  static getCommands() {
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
        .setName("war-scores")
        .setDescription("Get scores for the current regular war"),

      new SlashCommandBuilder()
        .setName("war-history")
        .setDescription("Get historical war data for the clan"),

      new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show help information and commands"),

      new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Get combined leaderboard summing all category scores")
        .addIntegerOption((option) =>
          option
            .setName("year")
            .setDescription("Year")
            .setRequired(false)
            .addChoices({ name: "2025", value: 2025 })
        )
        .addIntegerOption((option) =>
          option
            .setName("month")
            .setDescription("Month")
            .setRequired(false)
            .addChoices(
              { name: "January", value: 1 },
              { name: "February", value: 2 },
              { name: "March", value: 3 },
              { name: "April", value: 4 },
              { name: "May", value: 5 },
              { name: "June", value: 6 },
              { name: "July", value: 7 },
              { name: "August", value: 8 },
              { name: "September", value: 9 },
              { name: "October", value: 10 },
              { name: "November", value: 11 },
              { name: "December", value: 12 }
            )
        ),
    ];
  }
}
