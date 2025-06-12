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

app.post("/upload-image", urlencodedParser, async (req, res) => {
  const { id, image } = req.body.data;
  console.log("Received image ID:", image);

  const directusFileUrl = `https://mandar-resto-server.onrender.com/assets/${image}`;
  console.log("Downloading from:", directusFileUrl);

  try {
    const fileResponse = await fetch(directusFileUrl);

    if (!fileResponse.body || !fileResponse.ok) {
      console.error("Directus file download failed:", fileResponse.statusText);
      return res.status(400).json({ error: "File download failed" });
    }

    const contentType = fileResponse.headers.get("content-type");
    console.log("Fetched file content-type:", contentType);

    // Check content type
    if (!contentType || !contentType.startsWith("image/")) {
      return res.status(400).json({ error: "Not an image file" });
    }

    // Upload to Cloudinary using stream
    const uploadStream = v2.uploader.upload_stream(
      { folder: "MandarAssets" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          res.status(500).json({ error: "Cloudinary upload failed" });
        } else {
          console.log("Uploaded to Cloudinary:", result.secure_url);
          res.json({ cloudinary_url: result.secure_url });
        }
      }
    );

    fileResponse.body.pipeTo(uploadStream);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

app.listen(PORT, () => console.log(`Server run on port: ${PORT}`));

module.exports = app;
