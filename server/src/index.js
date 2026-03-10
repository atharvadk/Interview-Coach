require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const morgan    = require("morgan");
const session   = require("express-session");
const rateLimit = require("express-rate-limit");
const fs        = require("fs");

const app  = express();
const PORT = process.env.PORT || 5000;

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 2 }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

const sessionRoutes  = require("./routes/session");
const questionRoutes = require("./routes/questions");
const speechRoutes   = require("./routes/speech");
const evaluateRoutes = require("./routes/evaluate");
const reportRoutes   = require("./routes/report");
const faceRoutes     = require("./routes/face");

app.use("/api/session",   sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/speech",    speechRoutes);
app.use("/api/evaluate",  evaluateRoutes);
app.use("/api/report",    reportRoutes);
app.use("/api/face",      faceRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});