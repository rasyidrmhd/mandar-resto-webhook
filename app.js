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
  const { event, payload } = req.body;

  if (event !== "files.create") {
    return res.status(200).send("Not a file creation event.");
  }

  const fileUrl = payload.data.data.full_url;
  const fileId = payload.data.data.id;

  try {
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();

    // 🌟 Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "MandarAssets" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    console.log("Cloudinary URL:", result.secure_url);

    res.status(200).json({
      message: "File uploaded to Cloudinary!",
      cloudinaryUrl: result.secure_url,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Upload failed." });
  }
});

// 🌟 Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
