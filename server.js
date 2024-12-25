const express = require("express");
require('dotenv').config();
const bodyParser = require("body-parser");
const helmet = require('helmet');
const connectDB = require('./src/config/dbConfig');
const urlShortnerRoutes = require('./src/routes/urls');
const app = express();

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