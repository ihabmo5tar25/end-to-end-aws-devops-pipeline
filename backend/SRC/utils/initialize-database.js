import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract database name from MongoDB connection URI
 */
function extractDatabaseName(uri) {
  if (!uri) return null;
  try {
    // Parse the URI to extract database name
    const url = new URL(uri);
    // Database name is in the pathname (e.g., /recipes-system or /graduationproject)
    const dbName = url.pathname.replace(/^\//, "").split("/")[0];
    return dbName || null;
  } catch (error) {
    // If URI parsing fails, try to extract from connection string format
    // mongodb://host:port/database or mongodb+srv://host/database
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : null;
  }
}

/**
 * Get Atlas connection URL from dev.env file (before docker-compose overrides it)
 * Reads the file directly to avoid environment variable overrides
 */
function getAtlasConnectionUrl() {
  try {
    // Read dev.env file directly
    const envPath = path.join(__dirname, "..", "..", "config", "dev.env");
    const envContent = fs.readFileSync(envPath, "utf-8");

    // Parse CONNECTION_URL_DEPLOY from the file
    const lines = envContent.split("\n");
    for (const line of lines) {
      // Match CONNECTION_URL_DEPLOY="value" or CONNECTION_URL_DEPLOY='value'
      const match = line.match(/^CONNECTION_URL_DEPLOY\s*=\s*["']([^"']+)["']/);
      if (match) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error reading dev.env file:", error.message);
    return null;
  }
}

/**
 * Check if database is empty by checking recipes collection
 * Returns true if recipes collection doesn't exist or has 0 documents
 */
async function isDatabaseEmpty(uri, dbName) {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const db = conn.db;

    // Check if recipes collection exists and has documents
    const collections = await db.listCollections({ name: "recipes" }).toArray();

    if (collections.length === 0) {
      // Recipes collection doesn't exist
      await conn.close();
      return true;
    }

    // Check document count in recipes collection
    const recipesCount = await db.collection("recipes").countDocuments();

    await conn.close();

    // Database is empty if recipes collection has 0 documents
    return recipesCount === 0;
  } catch (error) {
    console.error(`Error checking database ${dbName}:`, error.message);
    throw error;
  }
}

/**
 * Get all collections from source database
 */
async function getCollections(uri, dbName) {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const db = conn.db;
    const collections = await db.listCollections().toArray();
    await conn.close();
    return collections.map((col) => col.name);
  } catch (error) {
    console.error(`Error getting collections from ${dbName}:`, error.message);
    throw error;
  }
}

/**
 * Clone a collection from source to target
 */
async function cloneCollection(
  sourceUri,
  targetUri,
  collectionName,
  sourceDbName,
  targetDbName
) {
  let sourceConn, targetConn;

  try {
    console.log(`  Cloning collection: ${collectionName}...`);

    // Connect to source
    sourceConn = await mongoose.createConnection(sourceUri).asPromise();
    const sourceDb = sourceConn.db;
    const sourceCollection = sourceDb.collection(collectionName);

    // Connect to target
    targetConn = await mongoose.createConnection(targetUri).asPromise();
    const targetDb = targetConn.db;
    const targetCollection = targetDb.collection(collectionName);

    // Get all documents from source
    const documents = await sourceCollection.find({}).toArray();

    if (documents.length === 0) {
      console.log(`    ⚠ Collection ${collectionName} is empty, skipping...`);
      return;
    }

    // Insert documents into target
    if (documents.length > 0) {
      await targetCollection.insertMany(documents, { ordered: false });
      console.log(
        `    ✓ Cloned ${documents.length} documents from ${collectionName}`
      );
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log(
        `    ⚠ Duplicate key error in ${collectionName}, some documents may already exist`
      );
    } else {
      console.error(`    ✗ Error cloning ${collectionName}:`, error.message);
      throw error;
    }
  } finally {
    if (sourceConn) await sourceConn.close();
    if (targetConn) await targetConn.close();
  }
}

/**
 * Initialize database - check if empty and clone from Atlas if needed
 * This runs during application startup
 */
export async function initializeDatabase() {
  // Only run in non-production environments
  if (process.env.NODE_ENV === "production") {
    console.log("⚠ Database initialization skipped in production");
    return;
  }

  // Get Atlas URL from dev.env file (before docker-compose overrides it)
  // This ensures we clone FROM Atlas TO Docker MongoDB
  const SOURCE_URI = getAtlasConnectionUrl(); // Atlas database from dev.env
  const TARGET_URI = process.env.CONNECTION_URL_LOCAL; // Docker MongoDB

  // Extract database names from connection URIs
  const SOURCE_DB_NAME = SOURCE_URI ? extractDatabaseName(SOURCE_URI) : null;
  const TARGET_DB_NAME = TARGET_URI ? extractDatabaseName(TARGET_URI) : null;

  // Skip if source URI is not configured
  if (!SOURCE_URI) {
    console.log(
      "⚠ CONNECTION_URL_DEPLOY not configured, skipping database clone"
    );
    return;
  }

  // Skip if target URI is not configured
  if (!TARGET_URI) {
    console.log(
      "⚠ CONNECTION_URL_LOCAL not configured, skipping database clone"
    );
    return;
  }

  // Validate database names were extracted
  if (!SOURCE_DB_NAME) {
    console.log(
      "⚠ Could not extract database name from CONNECTION_URL_DEPLOY, skipping database clone"
    );
    return;
  }

  if (!TARGET_DB_NAME) {
    console.log(
      "⚠ Could not extract database name from CONNECTION_URL_LOCAL, skipping database clone"
    );
    return;
  }

  try {
    console.log("=".repeat(60));
    console.log("Database Initialization");
    console.log("=".repeat(60));
    console.log(`Source (Atlas): ${SOURCE_DB_NAME} database`);
    console.log(`Target (Docker): ${TARGET_DB_NAME} database`);
    console.log();
    console.log(`Checking local database: ${TARGET_DB_NAME}...`);
    console.log("Checking recipes collection...");

    // Check if target database is empty (by checking recipes collection)
    const isEmpty = await isDatabaseEmpty(TARGET_URI, TARGET_DB_NAME);

    if (!isEmpty) {
      console.log("✓ Recipes collection has data, database is not empty");
      console.log("  Skipping clone");
      console.log("=".repeat(60));
      return;
    }

    console.log("✓ Recipes collection is empty or doesn't exist");
    console.log(`Cloning from Atlas database: ${SOURCE_DB_NAME}...`);
    console.log();

    // Get collections from source
    const collections = await getCollections(SOURCE_URI, SOURCE_DB_NAME);

    if (collections.length === 0) {
      console.log("⚠ Source database has no collections!");
      console.log("=".repeat(60));
      return;
    }

    console.log(`✓ Found ${collections.length} collections to clone`);
    console.log();

    // Clone each collection
    console.log("Starting clone process...");
    for (const collection of collections) {
      await cloneCollection(
        SOURCE_URI,
        TARGET_URI,
        collection,
        SOURCE_DB_NAME,
        TARGET_DB_NAME
      );
    }

    console.log();
    console.log("=".repeat(60));
    console.log("✓ Database initialization completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("✗ Database initialization failed!");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    console.error();
    console.error(
      "The application will continue to start, but database may be empty."
    );
    console.error(
      "You can manually clone the database using: pnpm run db:clone"
    );
    console.error("=".repeat(60));
    // Don't throw - allow app to start even if clone fails
  }
}
