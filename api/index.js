require("dotenv").config();

const express = require("express");
const { v2 } = require("cloudinary");
const bodyParser = require("body-parser");

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.get("/", (req, res) => res.send("Just webhook"));

app.get("/health", (req, res) => {
  return res.status(200).send("This webhook is 100% healthy (maybe)");
});

app.listen(PORT, () => console.log(`Server run on: ${PORT}`));

module.exports = app;
