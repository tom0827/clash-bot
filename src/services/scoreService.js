/**
 * Score Service
 * Handles all scoring calculations for different activities
 */

export class ScoreCalculator {
  calculateDonationScore(donations) {
    if (donations >= 10000) return 15;
    if (donations >= 7500) return 10;
    if (donations >= 5000) return 7;
    if (donations >= 2500) return 5;
    if (donations >= 500) return 3;
    return 0;
  }

  calculateCapitalRaidScore(capitalResourcesLooted) {
    if (capitalResourcesLooted >= 25000) return 5;
    if (capitalResourcesLooted >= 20000) return 3;
    if (capitalResourcesLooted >= 15000) return 2;
    if (capitalResourcesLooted >= 10000) return 1;
    return 0;
  }

  calculateWarLeagueScore(memberData) {
    // Check if player achieved max stars
    const maxStars =
      this._getMaxPossibleStars(memberData) == memberData.totalStars;

    if (maxStars) {
      if (memberData.totalBattles >= 3) return 30;
      if (memberData.totalBattles == 2) return 20;
      if (memberData.totalBattles == 1) return 10;
    }

    if (memberData.averageStars >= 2.0) {
      if (memberData.averageDestructionPercentage >= 80) return 25;
      if (memberData.averageDestructionPercentage >= 70) return 20;
      if (memberData.averageDestructionPercentage >= 60) return 15;
      if (memberData.averageDestructionPercentage >= 50) return 15;
    }

    if (memberData.averageStars >= 1.0) {
      return 5;
    }

    return 0;
  }

  calculateRegularWarScore(memberData) {
    // Regular war scoring: each player gets up to 2 attacks
    const totalStars = memberData.totalStars;

    if (totalStars === 6) return 3;
    if (totalStars >= 4) return 2;
    if (totalStars >= 2) return 1;
    return 0;
  }

  _getMaxPossibleStars(memberData) {
    return (memberData.attacks.length + memberData.missedAttacks) * 3;
  }
}
