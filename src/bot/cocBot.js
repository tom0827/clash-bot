/**
 * Discord Bot Commands
 * Handles Discord bot interactions for CoC scoring
 */

import { ClanService } from "../services/clanService.js";
import { CommandLogger } from "../utils/commandLogger.js";
import { DateUtils } from "../utils/dateUtils.js";
import clanHistoryService from "../services/clanHistoryService.js";
import clanCapitalAttackHistoryService from "../services/clanCapitalAttackHistoryService.js";
import warHistoryService from "../services/warHistoryService.js";
import cwlHistoryService from "../services/cwlHistoryService.js";
import { updateScoresForClan } from "../utils/updateScoresHelper.js";

export class CocBot {
  constructor() {
    this.clanService = new ClanService();
  }

  // Scores for current month donations
  async handleDonationScoresCommand() {
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

  // Scores for most recent capital raid, may still be in progress
  async handleRaidScoresCommand() {
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

  // Scores for most recent regular war, may still be in progress
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

  async handleWarHistoryCommand() {
    return await CommandLogger.logCommand("war-history", async () => {
      // Get all war history data
      const warHistoryData = await warHistoryService.findAll(
        {},
        { sort: { createdAt: -1 } } // Most recent first
      );

      // Format the war history data for display
      const formattedHistory = warHistoryData.map(war => ({
        state: war.data?.state || 'Unknown',
        clanAttacks: war.data?.clan?.attacks || 0,
        clanStars: war.data?.clan?.stars || 0,
        destructionPercentage: war.data?.clan?.destructionPercentage || 0,
        date: war.createdAt || new Date(war.data?.startTime || 0)
      }));

      return formattedHistory;
    });
  }

  async handleLeaderboardCommand(clanTag) {
    return await CommandLogger.logCommand("leaderboard", async () => {
      // Get current month data for all categories
      const donationScores = await this._getCurrentMonthDonationScores();
      const raidScores = await this._getCurrentMonthRaidScores();
      const cwlScores = await this._getCurrentMonthCWLScores(clanTag);
      const warScores = await this._getCurrentMonthWarScores(clanTag);

      // Combine all scores by player
      const leaderboard = this._combineAllScores(donationScores, raidScores, cwlScores, warScores);
      
      return leaderboard;
    });
  }

  async _getCurrentMonthDonationScores() {
    const currentMonth = DateUtils.currentMonthIndexInEastern();
    const { data } = await clanHistoryService.findOne(
      { month: currentMonth },
      { sort: { createdAt: -1 } }
    );
    
    if (!data) return [];
    
    return this.clanService.calculateDonationScores(data.memberList);
  }

  async _getCurrentMonthRaidScores() {
    const currentYear = new Date().getFullYear();
    const currentMonth = DateUtils.currentMonthIndexInEastern();
    
    // Get raids from current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const raidData = await clanCapitalAttackHistoryService.findOne(
      {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      },
      { sort: { createdAt: -1 } }
    );
    
    if (!raidData || !raidData.data) return [];
    
    return this.clanService.calculateCapitalRaidScores(raidData.data);
  }

  async _getCurrentMonthCWLScores(clanTag) {
    try {
      const currentMonth = DateUtils.currentMonthIndexInEastern();
      const currentYear = new Date().getFullYear();
      
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
      
      const cwlData = await cwlHistoryService.findOne(
        {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        },
        { sort: { createdAt: -1 } }
      );
      
      if (!cwlData || !cwlData.data) return [];
      
      // The stored data structure should be { leagueGroup, wars }
      const wars = cwlData.data.wars || cwlData.data;
      return this.clanService.calculateWarLeagueScores(wars, clanTag);
    } catch (error) {
      console.log("No CWL data found for current month:", error.message);
      return [];
    }
  }

  async _getCurrentMonthWarScores(clanTag) {
    const currentYear = new Date().getFullYear();
    const currentMonth = DateUtils.currentMonthIndexInEastern();
    
    // Get all wars from current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const wars = await warHistoryService.findAll(
      {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      },
      { sort: { createdAt: -1 } }
    );
    
    if (!wars || wars.length === 0) return [];
    
    // Sum scores from all wars in the month
    const allWarScores = {};
    
    for (const war of wars) {
      if (war.data) {
        const warScores = this.clanService.calculateRegularWarScores(war.data, clanTag);
        
        warScores.forEach(player => {
          if (!allWarScores[player.tag]) {
            allWarScores[player.tag] = {
              tag: player.tag,
              name: player.name,
              totalScore: 0
            };
          }
          allWarScores[player.tag].totalScore += player.score;
        });
      }
    }
    
    return Object.values(allWarScores);
  }

  _combineAllScores(donationScores, raidScores, cwlScores, warScores) {
    const playerMap = new Map();
    
    // Helper function to add or update player score
    const addPlayerScore = (player, category, score, details = {}) => {
      const existing = playerMap.get(player.tag) || {
        tag: player.tag,
        name: player.name,
        totalScore: 0,
        donations: 0,
        raids: 0,
        cwl: 0,
        wars: 0,
        breakdown: {
          donations: 0,
          raids: 0,
          cwl: 0,
          wars: 0
        }
      };
      
      existing.totalScore += score;
      existing[category] += score;
      existing.breakdown[category] = score;
      
      // Add category-specific details
      if (category === 'donations' && details.donations) {
        existing.donationCount = details.donations;
      }
      if (category === 'raids' && details.capitalResourcesLooted) {
        existing.raidGold = details.capitalResourcesLooted;
      }
      if (category === 'cwl' && details.totalStars !== undefined) {
        existing.cwlStars = details.totalStars;
      }
      
      playerMap.set(player.tag, existing);
    };
    
    // Add donation scores
    donationScores.forEach(player => {
      addPlayerScore(player, 'donations', player.score, { donations: player.donations });
    });
    
    // Add raid scores
    raidScores.forEach(player => {
      addPlayerScore(player, 'raids', player.score, { capitalResourcesLooted: player.capitalResourcesLooted });
    });
    
    // Add CWL scores
    cwlScores.forEach(player => {
      addPlayerScore(player, 'cwl', player.score, { totalStars: player.totalStars });
    });
    
    // Add war scores
    warScores.forEach(player => {
      addPlayerScore(player, 'wars', player.totalScore || player.score);
    });
    
    // Convert to array and sort by total score
    const leaderboard = Array.from(playerMap.values())
      .sort((a, b) => b.totalScore - a.totalScore);
    
    return leaderboard;
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
