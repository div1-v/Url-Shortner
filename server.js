require("dotenv").config();
const helmet = require("helmet");
const connectDB = require("./src/config/database");
const { rateLimit } = require("express-rate-limit");
const setupSwagger = require("./src/swagger/swagger");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const urlShortnerRoutes = require("./src/routes/urls");
const authRoutes = require("./src/routes/auth");

const app = express();

app.set('trust proxy', 1);


require("./src/config/passport");
app.use(morgan("combined"));
setupSwagger(app);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(limiter);

app.use(helmet());

app.get("/", (req, res) => {
  res.send("App started...");
});

app.use("/api", urlShortnerRoutes);
app.use("/api/auth", authRoutes);

connectDB();
process.on("uncaughtException", (error) => {
  console.log(`[uncaughtException] [Error]=> ${error}`);
});
process.on("unhandledRejection", (reason, promise) => {
  console.log(reason);
  console.log(
    `[unhandledRejection] [Error]=> reason: ${JSON.stringify(
      reason
    )}, ${JSON.stringify(promise)}`
  );
});

app.listen(process.env.PORT, () => {
  console.log("APP STARETD");
});

module.exports = app;
