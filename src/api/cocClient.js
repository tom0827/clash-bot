/**
 * Clash of Clans API Client
 * Handles all interactions with the CoC API
 */

const COC_API_BASE_URL = "https://api.clashofclans.com/v1";

export class CocApiClient {
  constructor() {
    this.apiToken = process.env.COC_API_TOKEN;
    if (!this.apiToken) {
      throw new Error("COC_API_TOKEN is not set in the environment");
    }
  }

  async makeRequest(endpoint) {
    const url = `${COC_API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`API error: ${response.status}`);
      error.status = response.status;
      error.body = text;
      throw error;
    }

    return response.json();
  }

  async fetchClanData(clanTag) {
    return this.makeRequest(`/clans/${encodeURIComponent(clanTag)}`);
  }

  async fetchPlayerData(playerTag) {
    return this.makeRequest(`/players/${encodeURIComponent(playerTag)}`);
  }

  async fetchCapitalRaidSeasons(clanTag, limit = 1) {
    const data = await this.makeRequest(
      `/clans/${encodeURIComponent(clanTag)}/capitalraidseasons?limit=${limit}`
    );
    return data.items;
  }

  async fetchCurrentWar(clanTag) {
    return this.makeRequest(`/clans/${encodeURIComponent(clanTag)}/currentwar`);
  }

  async fetchWarLeagueGroup(clanTag) {
    return this.makeRequest(
      `/clans/${encodeURIComponent(clanTag)}/currentwar/leaguegroup`
    );
  }

  async fetchWarFromTag(warTag) {
    return this.makeRequest(`/clanwarleagues/wars/${encodeURIComponent(warTag)}`);
  }

  async fetchMultipleWars(warTags) {
    if (!Array.isArray(warTags)) {
      throw new Error("warTags must be an array");
    }

    const requests = warTags.map(warTag => this.fetchWarFromTag(warTag));
    return Promise.all(requests);
  }
}