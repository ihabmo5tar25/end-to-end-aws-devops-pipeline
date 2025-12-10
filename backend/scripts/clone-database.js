import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, "..", "config", "dev.env") });

// Connection strings
const SOURCE_URI = process.env.CONNECTION_URL_DEPLOY; // Atlas database
const TARGET_URI = process.env.CONNECTION_URL_LOCAL; // Local database

const SOURCE_DB_NAME = "recipes-system";
const TARGET_DB_NAME = "graduationproject";

/**
 * Check if database is empty
 */
async function isDatabaseEmpty(uri, dbName) {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const db = conn.db;
    const collections = await db.listCollections().toArray();
    const isEmpty = collections.length === 0;
    
    if (!isEmpty) {
      // Check if collections have any documents
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        if (count > 0) {
          await conn.close();
          return false;
        }
      }
    }
    
    await conn.close();
    return true;
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
    return collections.map(col => col.name);
  } catch (error) {
    console.error(`Error getting collections from ${dbName}:`, error.message);
    throw error;
  }
}

/**
 * Clone a collection from source to target
 */
async function cloneCollection(sourceUri, targetUri, collectionName, sourceDbName, targetDbName) {
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
      console.log(`    ✓ Cloned ${documents.length} documents from ${collectionName}`);
    }
    
  } catch (error) {
    if (error.code === 11000) {
      console.log(`    ⚠ Duplicate key error in ${collectionName}, some documents may already exist`);
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
 * Main function to clone database
 */
async function cloneDatabase() {
  console.log("=".repeat(60));
  console.log("Database Cloning Script");
  console.log("=".repeat(60));
  console.log(`Source: ${SOURCE_DB_NAME} (Atlas)`);
  console.log(`Target: ${TARGET_DB_NAME} (Local)`);
  console.log();
  
  try {
    // Check if target database is empty
    console.log("Checking if local database is empty...");
    const isEmpty = await isDatabaseEmpty(TARGET_URI, TARGET_DB_NAME);
    
    if (!isEmpty) {
      console.log("⚠ Local database is NOT empty!");
      console.log("  Collections with data exist. Cloning will add duplicate data.");
      console.log("  Do you want to continue? (This script will continue automatically)");
      console.log();
    } else {
      console.log("✓ Local database is empty, safe to clone.");
      console.log();
    }
    
    // Get collections from source
    console.log("Fetching collections from source database...");
    const collections = await getCollections(SOURCE_URI, SOURCE_DB_NAME);
    
    if (collections.length === 0) {
      console.log("⚠ Source database has no collections!");
      return;
    }
    
    console.log(`✓ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col}`));
    console.log();
    
    // Clone each collection
    console.log("Starting clone process...");
    for (const collection of collections) {
      await cloneCollection(SOURCE_URI, TARGET_URI, collection, SOURCE_DB_NAME, TARGET_DB_NAME);
    }
    
    console.log();
    console.log("=".repeat(60));
    console.log("✓ Database cloning completed successfully!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("✗ Database cloning failed!");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    // Close all connections
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
cloneDatabase();

