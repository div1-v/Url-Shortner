const express = require("express");
require('dotenv').config();
const bodyParser = require("body-parser");
const helmet = require('helmet');
const connectDB = require('./src/config/database');
const urlShortnerRoutes = require('./src/routes/urls');
const {rateLimit} = require('express-rate-limit')

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', 
	legacyHeaders: false,
})

app.use(limiter)

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
    res.send("App started...");
});

app.use("/api", urlShortnerRoutes);

process.on('uncaughtException', (error) => {
    console.log(`[uncaughtException] [Error]=> ${error}`);
});
process.on('unhandledRejection', (reason, promise) => {
    console.log(reason);
    console.log(`[unhandledRejection] [Error]=> reason: ${JSON.stringify(reason)}, ${JSON.stringify(promise)}`);
});

app.listen(4000,()=>{
    console.log("APP STARETD");
})