import getDb from "../database/database.js";

class ClanCapitalAttackHistoryService {
  constructor() {
    this.collectionName = "clan_capital_attack_history";
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  // Create an entry per day. Update todays entry if it already exists.
  async updateOrCreate(clanCapitalAttackData) {
    const collection = await this.getCollection();

    const filter = { date: clanCapitalAttackData.startTime }; // We'll store the date-only part

    const update = {
      $set: {
        data: clanCapitalAttackData,
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

export default new ClanCapitalAttackHistoryService();
