import { ClanService } from "../services/clanService.js";
import clanHistoryService from "../services/clanHistoryService.js";
import clanCapitalAttackHistoryService from "../services/clanCapitalAttackHistoryService.js";
import warHistoryService from "../services/warHistoryService.js";
import cwlHistoryService from "../services/cwlHistoryService.js";

export const updateScoresForClan = async (clanTag) => {
  const clanService = new ClanService();
  try {
    // Get and save clan data
    const clanData = await clanService.getClanData(clanTag);
    const {
      type,
      description,
      location,
      isFamilyFriendly,
      badgeUrls,
      requiredTrophies,
      warFrequency,
      warWinStreak,
      isWarLogPublic,
      labels,
      requiredBuilderBaseTrophies,
      requiredTownhallLevel,
      clanCapital,
      chatLanguage,
      ...filteredClanData
    } = clanData;
    const clanHistoryUpdateOrCreatePromise =
      clanHistoryService.updateOrCreate(filteredClanData);

    // Get and save capital raid data
    const capitalRaidData = await clanService.getMostRecentCapitalRaid(clanTag);
    let clanCapitalUpdateOrCreatePromise;
    const { attackLog, defenseLog, ...filteredRaidData } = capitalRaidData;
    clanCapitalUpdateOrCreatePromise =
      clanCapitalAttackHistoryService.updateOrCreate(filteredRaidData);

    // Get and save war league scores
    try {
      const { leagueGroup, wars } = await clanService.getCWLData(clanTag);
      // cwlHistoryService.updateOrCreate(wars);
    } catch (cwlError) {
      console.log("CWL data not available:", cwlError.message);
    }

    // Get and save current war scores
    let warHistoryUpdateOrCreatePromise;
    try {
      const currentWar = await clanService.getCurrentWar(clanTag);
      console.log(currentWar)
      let warView;

      // Determine which side (either clan or opponent object) is our clan and delete the other before saving
      if (currentWar.clan.tag === clanTag) {
        warView = { ...currentWar, clan: currentWar.clan };
        delete warView.opponent;
      } else {
        warView = { ...currentWar, opponent: currentWar.opponent };
        delete warView.clan;
      }

      warHistoryUpdateOrCreatePromise =
        warHistoryService.updateOrCreate(warView);
    } catch (warError) {
      console.log("Current war data not available:", warError.message);
    }
    await Promise.all([
      clanHistoryUpdateOrCreatePromise,
      warHistoryUpdateOrCreatePromise,
      clanCapitalUpdateOrCreatePromise,
    ]);
  } catch (error) {
    throw new Error(`Failed to update scores: ${error.message}`);
  }
};
