const URL = "https://api.clashofclans.com/v1/players/";

/**
 * Fetch player data from the CoC API.
 * Does not read process.env so it can be imported safely.
 */
export async function fetchPlayerData(playerTag) {
    const apiToken = process.env.COC_API_TOKEN;
    if (!apiToken) throw new Error("COC_API_TOKEN is not set in the environment");
    const url = `${URL}${encodeURIComponent(playerTag)}`;
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
}