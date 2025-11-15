import getDb from "../database/database.js";

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

    const filter = { date: warHistoryData.startTime }; // We'll store the date-only part

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

  async findOne(query = {}) {
    const collection = await this.getCollection();
    return await collection.findOne(query);
  }
}

export default new WarHistoryService();
