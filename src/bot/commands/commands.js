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
        .setName("update-scores")
        .setDescription("Update and save all clan scores to files"),

      new SlashCommandBuilder()
        .setName("war-history")
        .setDescription("Get historical war data for the clan"),

      new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show help information and commands"),
    ];
  }
}