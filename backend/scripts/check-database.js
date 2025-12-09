import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, "..", "config", "dev.env") });

const TARGET_URI = process.env.CONNECTION_URL_LOCAL;
const TARGET_DB_NAME = "graduationproject";

/**
 * Check if database is empty and show collection statistics
 */
async function checkDatabase() {
  console.log("=".repeat(60));
  console.log("Database Status Check");
  console.log("=".repeat(60));
  console.log(`Database: ${TARGET_DB_NAME}`);
  console.log(`URI: ${TARGET_URI}`);
  console.log();

  try {
    const conn = await mongoose.createConnection(TARGET_URI).asPromise();
    const db = conn.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("✓ Database is EMPTY (no collections found)");
      console.log();
      console.log("You can clone data from Atlas using:");
      console.log("  pnpm run db:clone");
      await conn.close();
      return;
    }

    console.log(`Found ${collections.length} collection(s):`);
    console.log();

    let totalDocuments = 0;
    let hasData = false;

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      totalDocuments += count;

      if (count > 0) {
        hasData = true;
        console.log(`  ✓ ${collection.name}: ${count} document(s)`);
      } else {
        console.log(`  ○ ${collection.name}: 0 documents (empty)`);
      }
    }

    console.log();
    console.log("=".repeat(60));

    if (hasData) {
      console.log(`Database is NOT empty (${totalDocuments} total documents)`);
    } else {
      console.log("Database is EMPTY (collections exist but have no data)");
      console.log();
      console.log("You can clone data from Atlas using:");
      console.log("  pnpm run db:clone");
    }

    console.log("=".repeat(60));

    await conn.close();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("✗ Error checking database!");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    console.error();
    console.error("Make sure:");
    console.error("  1. MongoDB is running locally");
    console.error("  2. Connection string is correct in config/dev.env");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the check
checkDatabase();
