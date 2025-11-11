/**
 * Discord Bot Commands
 * Handles Discord bot interactions for CoC scoring
 */

import { ClanService } from '../services/clanService.js';
import { FileManager } from '../utils/fileUtils.js';
import { DateUtils } from '../utils/dateUtils.js';

export class CocBot {
  constructor() {
    this.clanService = new ClanService();
  }

  async handleClanScoreCommand(clanTag) {
    try {
      const date = DateUtils.getCurrentDateString();
      
      // Get clan data and calculate donation scores
      const clanData = await this.clanService.getClanData(clanTag);
      const donationScores = this.clanService.calculateDonationScores(clanData.memberList);
      
      // Get capital raid data and scores
      const capitalRaid = await this.clanService.getMostRecentCapitalRaid(clanTag);
      const capitalRaidScores = this.clanService.calculateCapitalRaidScores(capitalRaid);
      
      // Get war league data and scores (if available)
      let warLeagueScores = null;
      try {
        const { wars } = await this.clanService.getWarLeagueData(clanTag);
        warLeagueScores = this.clanService.calculateWarLeagueScores(wars, clanTag);
      } catch (error) {
        console.log('War league data not available:', error.message);
      }

      // Save data files
      await FileManager.saveAsJSON(clanData, `${clanTag}_clan_data_${date}`, "clans");
      await FileManager.saveAsJSON(donationScores, `${clanTag}_donation_scores_${date}`, "scores");
      await FileManager.saveAsJSON(capitalRaidScores, `${clanTag}_capital_raid_scores_${date}`, "scores");
      
      if (warLeagueScores) {
        await FileManager.saveAsJSON(warLeagueScores, `${clanTag}_war_league_scores_${date}`, "scores");
        await FileManager.saveAsCSV(warLeagueScores, `${clanTag}_war_league_scores_${date}`, "scores");
      }

      return {
        donationScores,
        capitalRaidScores,
        warLeagueScores,
        clanName: clanData.name
      };
      
    } catch (error) {
      console.error('Error fetching clan scores:', error);
      throw error;
    }
  }

  async handlePlayerInfoCommand(playerTag) {
    try {
      const playerData = await this.playerService.getPlayerData(playerTag);
      const date = DateUtils.getCurrentDateString();
      
      await FileManager.saveAsJSON(playerData, `${playerTag}_player_data_${date}`, "players");
      
      return playerData;
      
    } catch (error) {
      console.error('Error fetching player data:', error);
      throw error;
    }
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