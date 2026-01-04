import getDb from "../database/database.js";

class CwlHistoryService {
  constructor() {
    this.collectionName = "cwl_history";
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  // Create
  async updateOrCreate(season, cwlHistoryData) {
    const collection = await this.getCollection();

    // Ensure only one entry per season
    const filter = { season: season };

    const update = {
      $set: {
        data: cwlHistoryData,
        updatedAt: new Date(),
        season: season,
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

export default new CwlHistoryService();
