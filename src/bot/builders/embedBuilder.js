/**
 * Embed Builder
 * Creates Discord embeds for different command responses
 */

import { EmbedBuilder } from "discord.js";

export class EmbedBuilderService {
  constructor() {
    this.CHUNK_SIZE = 10;
  }

  createHelpEmbed() {
    return new EmbedBuilder()
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
          name: "/cwl-scores",
          value: "Get war league scores for all clan members",
          inline: false,
        },
        {
          name: "/war-scores",
          value: "Get scores for the current regular war",
          inline: false,
        },
        {
          name: "/update-scores",
          value: "Update and save all clan scores to files",
          inline: false,
        },
        {
          name: "/help",
          value: "Show this help message",
          inline: false,
        }
      );
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
              `${i + idx + 1}. **${player.name}**: ${
                player.totalStars
              }⭐ AVG: ${player.averageStars} (${player.score} pts)`
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

  createWarScoreEmbed(scoreData) {
    const embed = new EmbedBuilder()
      .setColor("#800080")
      .setTitle("⚔️ Regular War Scores")
      .setTimestamp();

    if (scoreData.length > 0) {
      for (let i = 0; i < scoreData.length; i += this.CHUNK_SIZE) {
        const chunk = scoreData.slice(i, i + this.CHUNK_SIZE);
        let warScores = chunk
          .map(
            (player, idx) =>
              `${i + idx + 1}. **${player.name}**: ${
                player.totalStars
              }⭐ (${player.totalAttacks} ATKs) - ${player.score} pts`
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
        value: "No war participants with scores available",
        inline: false,
      });
    }

    return embed;
  }

  createUpdateScoreEmbed(updateData) {
    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("📊 Scores Updated Successfully")
      .setDescription(`All clan scores have been updated on ${updateData.date}`)
      .setTimestamp();

    let statusMessage = "";
    let successCount = 0;

    updateData.files.forEach(file => {
      if (file.filename) {
        statusMessage += `✅ **${file.type.toUpperCase()}**: ${file.count} players saved\n`;
        successCount++;
      } else {
        statusMessage += `⚠️ **${file.type.toUpperCase()}**: ${file.error}\n`;
      }
    });

    embed.addFields(
      {
        name: "📈 Update Status",
        value: statusMessage,
        inline: false,
      },
      {
        name: "📁 Files Created",
        value: `${successCount}/${updateData.files.length} score files saved to /scores directory`,
        inline: false,
      }
    );

    return embed;
  }
}