import { MongoClient } from "mongodb";
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`;
console.log("MongoDB URI:", uri);

let client;
let db;

async function getDb() {
  if (db) {
    return db;
  }
  console.log("Connecting to MongoDB...");
  client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    db = client.db("app");

    // Initialize collections and indexes
    await initializeDatabase(db);

    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

async function initializeDatabase(db) {
  try {
    // Create collections if they don't exist
    const collections = [
      "clan_history",
      "war_history",
      "cwl_history",
      "clan_capital_attack_history",
    ];

    for (const collectionName of collections) {
      const exists = await db
        .listCollections({ name: collectionName })
        .hasNext();
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      }
    }

    console.log("Database initialization complete");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

export default getDb;
