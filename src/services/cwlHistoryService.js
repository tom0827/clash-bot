import getDb from '../database/database.js';

class CwlHistoryService {
  constructor() {
    this.collectionName = 'cwl_history';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  // Create
  async create(cwlHistoryData) {
    const collection = await this.getCollection();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const filter = { date: today }; // We'll store the date-only part

    const update = {
      $set: {
        data: cwlHistoryData,
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

  async findOne(query) {
    const collection = await this.getCollection();
    return await collection.findOne(query);
  }
}

export default new CwlHistoryService();