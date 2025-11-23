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
          name: "/war-history",
          value: "Get historical war data for the clan",
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
        },
        {
          name: "/leaderboard",
          value: "Get combined leaderboard summing all category scores (optional year/month parameters)",
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

  createWarHistoryEmbed(warHistoryData) {
    const embed = new EmbedBuilder()
      .setColor("#ff6600")
      .setTitle("📜 War History")
      .setTimestamp();

    if (warHistoryData.length > 0) {
      // Limit to most recent 10 wars for readability
      const recentWars = warHistoryData.slice(0, 10);
      
      let historyText = recentWars
        .map((war, idx) => {
          const dateStr = war.date instanceof Date ? 
            war.date.toLocaleDateString() : 
            new Date(war.date).toLocaleDateString();
          
          const stateEmoji = war.state === 'won' ? '🏆' : war.state === 'lost' ? '💀' : '⚖️';
          
          return `${stateEmoji} **${war.state.toUpperCase()}** (${dateStr})
⚔️ Attacks: ${war.clanAttacks} | ⭐ Stars: ${war.clanStars} | 💥 Destruction: ${war.destructionPercentage}%`;
        })
        .join("\n\n");

      embed.addFields({
        name: `📊 Recent Wars (${recentWars.length})`,
        value: historyText,
        inline: false,
      });

      if (warHistoryData.length > 10) {
        embed.addFields({
          name: "📈 Total Records",
          value: `Showing 10 most recent wars out of ${warHistoryData.length} total`,
          inline: false,
        });
      }
    } else {
      embed.addFields({
        name: "📊 Status",
        value: "No war history data available",
        inline: false,
      });
    }

    return embed;
  }

  createLeaderboardEmbed(data, year, month) {
    // Handle both old and new data structure
    const leaderboardData = data.leaderboard || data;
    const targetYear = year || data.year || new Date().getFullYear();
    const targetMonth = month || data.month || new Date().getMonth() + 1;
    
    const monthNames = ["", "January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[targetMonth];
    
    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("🏆 Monthly Leaderboard")
      .setDescription(`Combined scores from all categories for ${monthName} ${targetYear}`)
      .setTimestamp();

    if (leaderboardData.length > 0) {
      // Show top performers
      for (let i = 0; i < Math.min(leaderboardData.length, 15); i += this.CHUNK_SIZE) {
        const chunk = leaderboardData.slice(i, i + this.CHUNK_SIZE);
        let leaderboardText = chunk
          .map((player, idx) => {
            const rank = i + idx + 1;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
            
            let breakdown = [];
            if (player.breakdown.donations > 0) breakdown.push(`💰${player.breakdown.donations}`);
            if (player.breakdown.raids > 0) breakdown.push(`🏛️${player.breakdown.raids}`);
            if (player.breakdown.cwl > 0) breakdown.push(`⚔️${player.breakdown.cwl}`);
            if (player.breakdown.wars > 0) breakdown.push(`🛡️${player.breakdown.wars}`);
            
            const breakdownText = breakdown.length > 0 ? ` (${breakdown.join(" + ")})` : '';
            
            return `${medal} **${player.name}**: ${player.totalScore} pts${breakdownText}`;
          })
          .join("\n");

        embed.addFields({
          name: i === 0 ? "🏆 Top Players" : `📊 Players ${i + 1} - ${i + chunk.length}`,
          value: leaderboardText,
          inline: false,
        });
      }

      // Add category breakdown legend
      embed.addFields({
        name: "📋 Score Categories",
        value: "💰 Donations | 🏛️ Raids | ⚔️ CWL | 🛡️ Wars",
        inline: false,
      });

    } else {
      embed.addFields({
        name: "📊 Status",
        value: `No data available for ${monthName} ${targetYear}`,
        inline: false,
      });
    }

    return embed;
  }
}