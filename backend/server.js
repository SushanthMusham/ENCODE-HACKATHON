require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const cors = require("cors");
app.use(cors({
  origin: "*"
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
app.use("/api/auth", authRoutes);       // signup + login
app.use("/api/judge", auth, judgeRouter); // protected judge route

// -----------------------

app.listen(5000, () => console.log("Server running on port 5000"));
