require("dotenv").config();

const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("Just webhook"));

app.get("/health", (req, res) => {
  return res.status(200).send("This webhook is 100% healthy (maybe)");
});

module.exports = app;
module.exports.handler = serverless(app);
