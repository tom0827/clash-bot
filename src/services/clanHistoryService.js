import getDb from "../database/database.js";
import { DateUtils } from "../utils/dateUtils.js";

class ClanHistoryService {
  constructor() {
    this.collectionName = "clan_history";
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  // Creates an entry for today's clan history data. If called multiple times a day,
  // it updates the existing entry.
  async updateOrCreate(clanHistoryData) {
    const collection = await this.getCollection();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const filter = { month: DateUtils.currentMonthIndex() };

    const update = {
      $set: {
        data: clanHistoryData,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    };

    // Use upsert: true so it inserts if not found, otherwise updates.
    const options = { upsert: true };

    const result = await collection.updateOne(filter, update, options);
    return result;
  }

  async findOne(query = {}, options = {}) {
    const collection = await this.getCollection();
    return await collection.findOne(query, options);
  }
}

export default new ClanHistoryService();
