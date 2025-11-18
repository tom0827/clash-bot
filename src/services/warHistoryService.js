import getDb from "../database/database.js";
import { DateUtils } from "../utils/dateUtils.js";

class WarHistoryService {
  constructor() {
    this.collectionName = "war_history";
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async updateOrCreate(warHistoryData) {
    const collection = await this.getCollection();

    const filter = {
      date: DateUtils.toExtendedISO(warHistoryData.startTime),
    };

    const update = {
      $set: {
        data: warHistoryData,
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

  async findAll(query = {}, options = {}) {
    const collection = await this.getCollection();
    return await collection.find(query, options).toArray();
  }
}

export default new WarHistoryService();
