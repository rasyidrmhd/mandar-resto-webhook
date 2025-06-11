import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  return res.status(200).send("This webhook is 100% healthy (maybe)");
});

app.post("/upload-image", async (req, res) => {
  console.log("Webhook received:", req.body);
  const { id, image } = req.body.data;
  console.log("Received webhook:", req.body);

  try {
    // Get the file from Directus
    const directusFileUrl = `https://mandar-resto-server.onrender.com/assets/${image}`;
    const fileResponse = await fetch(directusFileUrl);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "MandarAssets" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    console.log("Uploaded to Cloudinary:", result.secure_url);

    // Respond with Cloudinary URL
    res.json({
      cloudinary_url: result.secure_url,
    });
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 🌟 Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
