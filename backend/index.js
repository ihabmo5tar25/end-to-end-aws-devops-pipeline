import express from "express";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db_connection from "./DB/connnection.js";
import { initializeTestImage } from "./SRC/utils/initialize-uploads.js";
import { initializeDatabase } from "./SRC/utils/initialize-database.js";
import authRouter from "./SRC/modules/Auth/auth.router.js";
import categoryRouter from "./SRC/modules/Category/category.router.js";
import countryRouter from "./SRC/modules/Country/country.router.js";
import ingredientRouter from "./SRC/modules/Ingredient/ingredient.router.js";
import receipeRouter from "./SRC/modules/Recipe/recipe.router.js";
import cartRouter from "./SRC/modules/Cart/cart.routes.js";
import bannerRouter from "./SRC/modules/Banner/banners.routes.js";
import reviewRouter from "./SRC/modules/Review/reviews.routes.js";
import aiRouter from "./SRC/modules/Ai/ai.routes.js";
import orderRouter from "./SRC/modules/Order/order.router.js";
import { globalResponse } from "./SRC/middlewares/globalResponce.js";
import { cloudinaryConfig } from "./SRC/utils/cloudinary.utils.js";
import recommendationRouter from "./SRC/modules/Recommendations/recommendation.routes.js";
import addressRouter from "./SRC/modules/Address/address.routes.js";
import couponRouter from "./SRC/modules/Coupon/coupon.routes.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  config({ path: "./config/dev.env" });
}

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "accessToken"],
  })
);
app.use(express.json());

const uploadsPath = path.join(__dirname, "SRC", "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/country", countryRouter);
app.use("/ingredient", ingredientRouter);
app.use("/recipe", receipeRouter);
app.use("/cart", cartRouter);
app.use("/banner", bannerRouter);
app.use("/review", reviewRouter);
app.use("/ai", aiRouter);
app.use("/recommendation", recommendationRouter);
app.use("/order", orderRouter);
app.use("/address", addressRouter);
app.use("/coupon", couponRouter);

app.use(globalResponse);

// Initialize database and test image before starting server
async function initializeApp() {
  try {
    // Initialize database (check and clone if empty)
    await initializeDatabase();

    // Initialize test image
    initializeTestImage();

    // Connect to database
    await db_connection();

    // Start the server after initialization
    app.listen(port, () => {
      console.log(`app is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
}

initializeApp();

app.get("/test", (req, res) => {
  res.json({ message: "test endpoint" });
});

app.get("/test-upload", async (req, res) => {
  const result = await cloudinaryConfig().api.ping();
  res.json(result);
});

app.use("*", (req, res, _next) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

export default app;
