/**
 * Command Handler
 * Handles all slash command routing and execution
 */

export class CommandHandler {
  constructor(cocBot, embedBuilder) {
    this.cocBot = cocBot;
    this.embedBuilder = embedBuilder;
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
      case "war-scores":
        await this.handleWarScoresCommand(interaction);
        break;
      case "war-history":
        await this.handleWarHistoryCommand(interaction);
        break;
      case "help":
        await this.handleHelpCommand(interaction);
        break;
      case "leaderboard":
        await this.handleLeaderboardCommand(interaction);
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

      const embed = this.embedBuilder.createDonationScoreEmbed(result);
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

      const embed = this.embedBuilder.createRaidScoreEmbed(result);
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

      const embed = this.embedBuilder.createCWLScoreEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleWarScoresCommand(interaction) {
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
      const result = await this.cocBot.handleWarScoresCommand(clanTag);

      if (typeof result === "string" && result.startsWith("Error")) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.embedBuilder.createWarScoreEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleHelpCommand(interaction) {
    const embed = this.embedBuilder.createHelpEmbed();
    await interaction.reply({ embeds: [embed] });
  }

  async handleWarHistoryCommand(interaction) {
    await interaction.deferReply();

    try {
      const result = await this.cocBot.handleWarHistoryCommand();

      if (typeof result === "string" && result.startsWith("Error")) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.embedBuilder.createWarHistoryEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }

  async handleLeaderboardCommand(interaction) {
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
      const result = await this.cocBot.handleLeaderboardCommand(clanTag);

      if (typeof result === "string" && result.startsWith("Error")) {
        await interaction.editReply({ content: result });
        return;
      }

      const embed = this.embedBuilder.createLeaderboardEmbed(result);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `Error: ${error.message}` });
    }
  }
}