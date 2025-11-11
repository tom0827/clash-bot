/**
 * Clan Service
 * Handles clan-related operations and data processing
 */

import { CocApiClient } from '../api/cocClient.js';
import { ScoreCalculator } from './scoreService.js';

export class ClanService {
  constructor() {
    this.apiClient = new CocApiClient();
    this.scoreCalculator = new ScoreCalculator();
  }

  async getClanData(clanTag) {
    return this.apiClient.fetchClanData(clanTag);
  }

  async getMostRecentCapitalRaid(clanTag) {
    const raids = await this.apiClient.fetchCapitalRaidSeasons(clanTag, 1);
    return raids[0];
  }

  async getCurrentWar(clanTag) {
    return this.apiClient.fetchCurrentWar(clanTag);
  }

  async getCWLData(clanTag) {
    const leagueGroup = await this.apiClient.fetchCWLGroup(clanTag);
    const warTags = leagueGroup.rounds
      .map(round => round.warTags)
      .flat();
    
    const wars = await this.apiClient.fetchMultipleWars(warTags);
    return { leagueGroup, wars };
  }

  calculateDonationScores(clanMembers) {
    return clanMembers
      .map(member => ({
        tag: member.tag,
        name: member.name,
        donations: member.donations,
        score: this.scoreCalculator.calculateDonationScore(member.donations),
      }))
      .sort((a, b) => b.donations - a.donations);
  }

  calculateCapitalRaidScores(capitalRaid) {
    return capitalRaid.members
      .map(member => ({
        tag: member.tag,
        name: member.name,
        capitalResourcesLooted: member.capitalResourcesLooted,
        score: this.scoreCalculator.calculateCapitalRaidScore(member.capitalResourcesLooted),
      }))
      .sort((a, b) => b.capitalResourcesLooted - a.capitalResourcesLooted);
  }

  calculateWarLeagueScores(wars, clanTag) {
    const allWarsDone = wars.every(war => war.state === "warEnded");
    
    if (!allWarsDone) {
      throw new Error("Not all wars in the league group have ended yet.");
    }

    const memberDataMap = new Map();

    wars
      .filter(war => war.clan.tag === clanTag || war.opponent.tag === clanTag)
      .forEach(war => {
        if (war.clan.tag === clanTag) {
          this._processWarMembers(war.clan.members, memberDataMap);
        } else if (war.opponent.tag === clanTag) {
          this._processWarMembers(war.opponent.members, memberDataMap);
        }
      });

    // Calculate stats and scores
    memberDataMap.forEach(memberData => {
      this._calculateMemberStats(memberData);
      memberData.score = this.scoreCalculator.calculateWarLeagueScore(memberData);
    });

    return Array.from(memberDataMap.values()).sort((a, b) => b.score - a.score);
  }

  _processWarMembers(members, memberDataMap) {
    members.forEach(member => {
      if (!memberDataMap.has(member.tag)) {
        memberDataMap.set(member.tag, {
          tag: member.tag,
          name: member.name,
          attacks: [],
          missedAttacks: 0,
        });
      }
      
      const memberData = memberDataMap.get(member.tag);
      if (member?.attacks && member.attacks.length > 0) {
        memberData.attacks.push(...member.attacks);
      } else {
        memberData.missedAttacks += 1;
      }
    });
  }

  _calculateMemberStats(memberData) {
    memberData.totalStars = memberData.attacks.reduce(
      (sum, attack) => sum + attack.stars,
      0
    );
    memberData.totalDestructionPercentage = memberData.attacks.reduce(
      (sum, attack) => sum + attack.destructionPercentage,
      0
    );
    
    memberData.totalBattles = memberData.attacks.length + memberData.missedAttacks;
    memberData.averageStars = parseFloat((memberData.totalStars / memberData.totalBattles).toFixed(2));
    memberData.averageDestructionPercentage = parseFloat(
      (memberData.totalDestructionPercentage / memberData.totalBattles).toFixed(2)
    );
  }
}