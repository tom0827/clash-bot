/**
 * Discord Bot Commands
 * Handles Discord bot interactions for CoC scoring
 */

import { ClanService } from "../services/clanService.js";
import { CommandLogger } from "../utils/commandLogger.js";
import clanHistoryService from "../services/clanHistoryService.js";
import clanCapitalAttackHistoryService from "../services/clanCapitalAttackHistoryService.js";
import warHistoryService from "../services/warHistoryService.js";
import cwlHistoryService from "../services/cwlHistoryService.js";
import { updateScoresForClan } from "../utils/updateScoresHelper.js";

export class CocBot {
  constructor() {
    this.clanService = new ClanService();
  }

  async handleDonationScoresCommand(clanTag) {
    return await CommandLogger.logCommand("donation-scores", async () => {
      // Get clan data and calculate donation scores only
      const { data } = await clanHistoryService.findOne(
        {},
        { sort: { createdAt: -1 } } // Most recent entry
      );
      const donationScores = this.clanService.calculateDonationScores(
        data.memberList
      );

      return donationScores;
    });
  }

  async handleRaidScoresCommand(clanTag) {
    return await CommandLogger.logCommand("raid-scores", async () => {
      // Get capital raid data and scores only
      const { data } = await clanCapitalAttackHistoryService.findOne(
        {},
        { sort: { createdAt: -1 } } // Most recent entry
      );
      const capitalRaidScores =
        this.clanService.calculateCapitalRaidScores(data);

      return capitalRaidScores;
    });
  }

  async handleCWLScoresCommand(clanTag) {
    return await CommandLogger.logCommand("cwl-scores", async () => {
      // Get war league data and scores only
      const { wars } = await this.clanService.getCWLData(clanTag);
      const warLeagueScores = this.clanService.calculateWarLeagueScores(
        wars,
        clanTag
      );

      return warLeagueScores;
    });
  }

  async handleWarScoresCommand(clanTag) {
    return await CommandLogger.logCommand("war-scores", async () => {
      // Get current war data and scores only
      const { data } = await warHistoryService.findOne(
        {},
        { sort: { createdAt: -1 } } // Most recent entry
      );
      const warScores = this.clanService.calculateRegularWarScores(
        data,
        clanTag
      );

      return warScores;
    });
  }

  // Handles all fetching from Clash of Clans API and saving to DB
  async handleUpdateScoresCommand(clanTag) {
    return await CommandLogger.logCommand("update-scores", async () => {
      try {
        await updateScoresForClan(clanTag);
      } catch (error) {
        throw new Error(`Failed to update scores: ${error.message}`);
      }
    });
  }

  formatScoreResponse(donationScores, capitalRaidScores, warLeagueScores) {
    let response = "**Clan Scores**\n\n";

    response += "**Top 5 Donation Scores:**\n";
    donationScores.slice(0, 5).forEach((player, index) => {
      response += `${index + 1}. ${player.name}: ${
        player.donations
      } donations (${player.score} points)\n`;
    });

    response += "\n**Top 5 Capital Raid Scores:**\n";
    capitalRaidScores.slice(0, 5).forEach((player, index) => {
      response += `${index + 1}. ${player.name}: ${
        player.capitalResourcesLooted
      } gold (${player.score} points)\n`;
    });

    if (warLeagueScores) {
      response += "\n**Top 5 War League Scores:**\n";
      warLeagueScores.slice(0, 5).forEach((player, index) => {
        response += `${index + 1}. ${player.name}: ${player.totalStars}★ (${
          player.score
        } points)\n`;
      });
    }

    return response;
  }
}
