import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize test image in uploads directory
 * Copies the test image from backend root to uploads/general/ if it doesn't exist
 * This allows testing the static file serving functionality
 */
export function initializeTestImage() {
  try {
    // Get paths relative to this file's location
    const backendRoot = path.resolve(__dirname, "..", "..");
    const uploadsPath = path.join(backendRoot, "SRC", "uploads");
    const generalPath = path.join(uploadsPath, "general");
    const testImagePath = path.join(
      generalPath,
      "Variety-fruits-vegetables.jpg"
    );
    const sourceImagePath = path.join(
      backendRoot,
      "Variety-fruits-vegetables.jpg"
    );

    // Create uploads/general directory if it doesn't exist
    if (!fs.existsSync(generalPath)) {
      fs.mkdirSync(generalPath, { recursive: true });
      console.log("✓ Created uploads/general directory");
    }

    // Copy test image if it doesn't exist in uploads
    if (!fs.existsSync(testImagePath) && fs.existsSync(sourceImagePath)) {
      fs.copyFileSync(sourceImagePath, testImagePath);
      console.log(
        "✓ Test image copied to uploads/general/Variety-fruits-vegetables.jpg"
      );
      console.log(
        "  Accessible at: http://localhost:3000/uploads/general/Variety-fruits-vegetables.jpg"
      );
    } else if (fs.existsSync(testImagePath)) {
      console.log("✓ Test image already exists in uploads/general/");
    } else {
      console.log("⚠ Source test image not found, skipping copy");
    }
  } catch (error) {
    console.error("Error initializing test image:", error.message);
  }
}
