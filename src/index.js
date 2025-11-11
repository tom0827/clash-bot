import dotenv from "dotenv";
dotenv.config();
import { saveDataToFile, saveAsCSV } from "./utils.js";
import {
  fetchMostRecentCapitalRaidForClan,
  calculateCapitalRaidScoreForAllMembers,
  fetchCurrentWarForClan,
  calculateDonationScoreForAllMembers,
  fetchClanData,
  fetchCurrentWarLeagueGroupForClan,
  fetchWarsForTags,
  calculateClanWarLeagueScoreForAllMembers,
} from "./clanData.js";

import { fetchPlayerData } from "./playerData.js";

const clanTag = "#2LV0CCP9P";
const playerTag = "#98CYUGLP";

const main = async () => {
  const date = new Date().toISOString().split("T")[0];
  //   const playerData = await fetchPlayerData(playerTag);
  //   const filename = await saveDataToFile(playerData, playerTag, "players");

  //   const clanData = await fetchClanData(clanTag);
  //   await saveDataToFile(clanData, clanTag, "clans");

  //   const donationScore = calculateDonationScoreForAllMembers(
  //     clanData.memberList
  //   );
  //   await saveDataToFile(
  //     donationScore,
  //     `${clanTag}_donation_scores_${date}`,
  //     "scores"
  //   );

  //   const capitalRaid = await fetchMostRecentCapitalRaidForClan(clanTag);
  //   await saveDataToFile(capitalRaid, `${clanTag}_capital_raid_${date}`, ".");

  //   const capitalRaidScore = calculateCapitalRaidScoreForAllMembers(capitalRaid);
  //   await saveDataToFile(
  //     capitalRaidScore,
  //     `${clanTag}_capital_raid_scores_${date}`,
  //     "scores"
  //   );

  //   const currentRegularWar = await fetchCurrentWarForClan(clanTag);

  const currentWarLeagueGroup = await fetchCurrentWarLeagueGroupForClan(
    clanTag
  );
  const warTags = currentWarLeagueGroup.rounds
    .map((round) => round.warTags)
    .flat();
  const clanWarLeagueData = await fetchWarsForTags(warTags);
  const clanWarLeagueScore = calculateClanWarLeagueScoreForAllMembers(
    clanWarLeagueData,
    clanTag
  );
  saveDataToFile(
    clanWarLeagueScore,
    `${clanTag}_clan_war_league_scores_${date}`,
    "scores"
  );
  saveAsCSV(
    clanWarLeagueScore,
    `${clanTag}_clan_war_league_scores_${date}`,
    "scores"
  );
};

main();
