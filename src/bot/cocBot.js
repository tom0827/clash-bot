/**
 * Discord Bot Commands
 * Handles Discord bot interactions for CoC scoring
 */

import { ClanService } from '../services/clanService.js';
import { FileManager } from '../utils/fileUtils.js';
import { DateUtils } from '../utils/dateUtils.js';
import { CommandLogger } from '../utils/commandLogger.js';

export class CocBot {
  constructor() {
    this.clanService = new ClanService();
  }

  async handleDonationScoresCommand(clanTag) {
    return await CommandLogger.logCommand('donation-scores', async () => {
      const date = DateUtils.getCurrentDateString();

      // Get clan data and calculate donation scores only
      const clanData = await this.clanService.getClanData(clanTag);
      const donationScores = this.clanService.calculateDonationScores(clanData.memberList);

      // Save data files
      await FileManager.saveAsJSON(clanData, `${clanTag}_clan_data_${date}`, "clans");
      await FileManager.saveAsJSON(donationScores, `${clanTag}_donation_scores_${date}`, "scores");

      return donationScores;
    });
  }

  async handleRaidScoresCommand(clanTag) {
    return await CommandLogger.logCommand('raid-scores', async () => {
      const date = DateUtils.getCurrentDateString();
      
      // Get capital raid data and scores only
      const capitalRaid = await this.clanService.getMostRecentCapitalRaid(clanTag);
      const capitalRaidScores = this.clanService.calculateCapitalRaidScores(capitalRaid);
      
      // Save data file
      await FileManager.saveAsJSON(capitalRaidScores, `${clanTag}_capital_raid_scores_${date}`, "scores");

      return capitalRaidScores;
    });
  }

  async handleCWLScoresCommand(clanTag) {
    return await CommandLogger.logCommand('cwl-scores', async () => {
      const date = DateUtils.getCurrentDateString();
      
      // Get war league data and scores only
      const { wars } = await this.clanService.getCWLData(clanTag);
      const warLeagueScores = this.clanService.calculateWarLeagueScores(wars, clanTag);
      
      // Save data file
      await FileManager.saveAsJSON(warLeagueScores, `${clanTag}_war_league_scores_${date}`, "scores");

      return warLeagueScores;
    });
  }

  async handlePlayerInfoCommand(playerTag) {
    return await CommandLogger.logCommand('player-info', async () => {
      const playerData = await this.playerService.getPlayerData(playerTag);
      const date = DateUtils.getCurrentDateString();
      
      await FileManager.saveAsJSON(playerData, `${playerTag}_player_data_${date}`, "players");
      
      return playerData;
    });
  }

  formatScoreResponse(donationScores, capitalRaidScores, warLeagueScores) {
    let response = "**Clan Scores**\n\n";
    
    response += "**Top 5 Donation Scores:**\n";
    donationScores.slice(0, 5).forEach((player, index) => {
      response += `${index + 1}. ${player.name}: ${player.donations} donations (${player.score} points)\n`;
    });
    
    response += "\n**Top 5 Capital Raid Scores:**\n";
    capitalRaidScores.slice(0, 5).forEach((player, index) => {
      response += `${index + 1}. ${player.name}: ${player.capitalResourcesLooted} gold (${player.score} points)\n`;
    });
    
    if (warLeagueScores) {
      response += "\n**Top 5 War League Scores:**\n";
      warLeagueScores.slice(0, 5).forEach((player, index) => {
        response += `${index + 1}. ${player.name}: ${player.totalStars}★ (${player.score} points)\n`;
      });
    }
    
    return response;
  }
}