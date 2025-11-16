import { ClanService } from "../services/clanService.js";
import clanHistoryService from "../services/clanHistoryService.js";
import clanCapitalAttackHistoryService from "../services/clanCapitalAttackHistoryService.js";
import warHistoryService from "../services/warHistoryService.js";
import cwlHistoryService from "../services/cwlHistoryService.js";

export const updateScoresForClan = async (clanTag) => {
  const clanService = new ClanService();
  try {
    // Get and save clan data
    await updateClanData(clanService, clanTag);

    // Get and save capital raid data
    await updateClanCapitalData(clanService, clanTag);

    // Get and save war league scores
    // TODO: Enable when ready
    // await updateClanWarLeagueData(clanService, clanTag);

    // Get and save current war data
    await updateCurrentWarData(clanService, clanTag);
  } catch (error) {
    throw new Error(`Failed to update scores: ${error.message}`);
  }
};

async function updateClanWarLeagueData(clanService, clanTag) {
  try {
    const { leagueGroup, wars } = await clanService.getCWLData(clanTag);
    // cwlHistoryService.updateOrCreate(wars);
  } catch (cwlError) {
    console.log("CWL data not available:", cwlError.message);
  }
}

async function updateClanCapitalData(clanService, clanTag) {
  const capitalRaidData = await clanService.getMostRecentCapitalRaid(clanTag);
  let clanCapitalUpdateOrCreatePromise;
  const { attackLog, defenseLog, ...filteredRaidData } = capitalRaidData;
  clanCapitalUpdateOrCreatePromise =
    clanCapitalAttackHistoryService.updateOrCreate(filteredRaidData);
  return clanCapitalUpdateOrCreatePromise;
}

async function updateClanData(clanService, clanTag) {
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
  return clanHistoryUpdateOrCreatePromise;
}

async function updateCurrentWarData(clanService, clanTag) {
  let warHistoryUpdateOrCreatePromise;
  try {
    const currentWar = await clanService.getCurrentWar(clanTag);

    if (currentWar.state === "notInWar") return;

    let warView;

    // Determine which side (either clan or opponent object) is our clan and delete the other before saving, keep the enemyClanTag for uniqueness
    if (currentWar.clan.tag === clanTag) {
      warView = { ...currentWar, clan: currentWar.clan };
      delete warView.opponent;
    } else {
      warView = { ...currentWar, clan: currentWar.opponent };
      delete warView.clan;
    }

    warHistoryUpdateOrCreatePromise = warHistoryService.updateOrCreate(warView);
  } catch (warError) {
    console.log("Current war data not available:", warError.message);
  }
  return warHistoryUpdateOrCreatePromise;
}
