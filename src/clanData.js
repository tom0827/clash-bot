const URL = "https://api.clashofclans.com/v1/";

export const fetchClanData = async (clanTag) => {
  const apiToken = process.env.COC_API_TOKEN;
  if (!apiToken) throw new Error("COC_API_TOKEN is not set in the environment");
  const url = `${URL}clans/${encodeURIComponent(clanTag)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API error: ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
};

export const calculateDonationScoreForAllMembers = (clanMembers) => {
  const stats = clanMembers
    .map((member) => {
      return {
        tag: member.tag,
        name: member.name,
        donations: member.donations,
        score: getDonationScore(member.donations),
      };
    })
    .sort((a, b) => b.donations - a.donations);
  return stats;
};

export const fetchMostRecentCapitalRaidForClan = async (clanTag) => {
  const apiToken = process.env.COC_API_TOKEN;
  if (!apiToken) throw new Error("COC_API_TOKEN is not set in the environment");
  const url = `${URL}clans/${encodeURIComponent(
    clanTag
  )}/capitalraidseasons?limit=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API error: ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return (await res.json()).items[0];
};

export const calculateCapitalRaidScoreForAllMembers = (capitalRaid) => {
  const stats = capitalRaid.members
    .map((member) => {
      return {
        tag: member.tag,
        name: member.name,
        capitalResourcesLooted: member.capitalResourcesLooted,
        score: getCapitalRaidScore(member.capitalResourcesLooted),
      };
    })
    .sort((a, b) => b.capitalResourcesLooted - a.capitalResourcesLooted);

  return stats;
};

export const fetchCurrentWarForClan = async (clanTag) => {
  const apiToken = process.env.COC_API_TOKEN;
  if (!apiToken) throw new Error("COC_API_TOKEN is not set in the environment");
  const url = `${URL}clans/${encodeURIComponent(clanTag)}/currentwar`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API error: ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
};

export const fetchCurrentWarLeagueGroupForClan = async (clanTag) => {
  const apiToken = process.env.COC_API_TOKEN;
  if (!apiToken) throw new Error("COC_API_TOKEN is not set in the environment");
  const url = `${URL}clans/${encodeURIComponent(
    clanTag
  )}/currentwar/leaguegroup`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API error: ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
};

export const fetchWarsForTags = async (warTags) => {
  if (!Array.isArray(warTags)) {
    throw new Error("warTags must be an array");
  }

  const apiToken = process.env.COC_API_TOKEN;
  if (!apiToken) throw new Error("COC_API_TOKEN is not set in the environment");

  const warBase = `${URL}clanwarleagues/wars/`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    Accept: "application/json",
  };

  const requests = warTags.map(async (warTag) => {
    const url = `${warBase}${encodeURIComponent(warTag)}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      const text = await res.text();
      const err = new Error(`API error fetching war ${warTag}: ${res.status}`);
      err.status = res.status;
      err.body = text;
    }

    return res.json();
  });

  return Promise.all(requests);
};

export const calculateClanWarLeagueScoreForAllMembers = (
  clanWarLeagueData,
  clanTag
) => {
  const allWarsDone = clanWarLeagueData.every(
    (war) => war.state === "warEnded"
  );

  if (!allWarsDone) {
    throw new Error("Not all wars in the league group have ended yet.");
  }

  let clanMembersDataMap = new Map();

  clanWarLeagueData
    .filter((war) => war.clan.tag === clanTag || war.opponent.tag === clanTag)
    .forEach((war) => {
      if (war.clan.tag === clanTag) {
        processWarMembers(war.clan.members, clanMembersDataMap);
      } else if (war.opponent.tag === clanTag) {
        processWarMembers(war.opponent.members, clanMembersDataMap);
      }
    });

  // Calculate total stars, average stars, average destruction percentage
  clanMembersDataMap.forEach((memberData) => {
    memberData.totalStars = memberData.attacks.reduce(
      (sum, attack) => sum + attack.stars,
      0
    );
    memberData.totalDestructionPercentage = memberData.attacks.reduce(
      (sum, attack) => sum + attack.destructionPercentage,
      0
    );
    memberData.averageStars = parseFloat(
      (
        memberData.totalStars /
        (memberData.attacks.length + memberData.missedAttacks)
      ).toFixed(2)
    );
    memberData.averageDestructionPercentage = parseFloat(
      (
        memberData.totalDestructionPercentage /
        (memberData.attacks.length + memberData.missedAttacks)
      ).toFixed(2)
    );
    memberData.score = calculateClanWarLeagueScore(memberData);
  });

  return Array.from(clanMembersDataMap.values()).sort(
    (a, b) => b.score - a.score
  );
};

const getDonationScore = (donations) => {
  if (donations >= 10000) {
    return 15;
  } else if (donations >= 7500) {
    return 10;
  } else if (donations >= 5000) {
    return 7;
  } else if (donations >= 2500) {
    return 5;
  } else if (donations >= 500) {
    return 3;
  } else {
    return 0;
  }
};

const getCapitalRaidScore = (capitalResourcesLooted) => {
  if (capitalResourcesLooted >= 25000) {
    return 5;
  } else if (capitalResourcesLooted >= 20000) {
    return 3;
  } else if (capitalResourcesLooted >= 15000) {
    return 2;
  } else if (capitalResourcesLooted >= 10000) {
    return 1;
  } else {
    return 0;
  }
};

const processWarMembers = (members, clanMembersDataMap) => {
  members.forEach((member) => {
    if (!clanMembersDataMap.has(member.tag)) {
      clanMembersDataMap.set(member.tag, {
        tag: member.tag,
        name: member.name,
        attacks: [],
        missedAttacks: 0,
      });
    }
    if (member?.attacks && member.attacks.length > 0) {
      clanMembersDataMap.get(member.tag).attacks.push(...member.attacks);
    } else {
      clanMembersDataMap.get(member.tag).missedAttacks += 1;
    }
  });
};

const calculateClanWarLeagueScore = (memberData) => {
  if (memberData.totalStars === maxStarsPossible(memberData)) {
    return 30;
  } else if (
    memberData.averageStars >= 2.0 &&
    memberData.averageDestructionPercentage >= 80
  ) {
    return 25;
  } else if (
    memberData.averageStars >= 2.0 &&
    memberData.averageDestructionPercentage >= 70
  ) {
    return 20;
  } else if (
    memberData.averageStars >= 2.0 &&
    memberData.averageDestructionPercentage >= 60
  ) {
    return 15;
  } else if (
    memberData.averageStars >= 2 &&
    memberData.averageDestructionPercentage >= 50
  ) {
    return 15;
  } else if (memberData.averageStars >= 1.0) {
    return 5;
  } else {
    return 0;
  }
};

const maxStarsPossible = (memberData) => {
  return (memberData.attacks.length + memberData.missedAttacks) * 3;
};
