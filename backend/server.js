require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// --- 1. INCREASE BODY SIZE LIMIT HERE ---
// Increase to 50mb (or more) to handle base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 2. CLEANER CORS SETUP ---
// You had cors() called twice. Keep just this one configuration.
app.use(cors({
  origin: "*", // or your specific frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// DB
const connectDB = require("./db");
connectDB();

// Auth middleware
const auth = require("./middleware/authMiddleware");

// Routes
const authRoutes = require("./routes/auth");
const judgeRouter = require("./routes/judge");

// ---- Mount Routes ----
app.use("/api/auth", authRoutes);       
app.use("/api/judge", auth, judgeRouter); 

// -----------------------

app.listen(5000, () => console.log("Server running on port 5000"));