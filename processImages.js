const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

// Define the source and destination directories
const srcDir = "./images/slider";
const thumbDir = "./images/slider/thumbnails";
const resizedDir = "./images/slider/resized";

// Ensure the destination directories exist
fs.ensureDirSync(thumbDir);
fs.ensureDirSync(resizedDir);

// Function to process images
async function processImages() {
  try {
    // Get a list of image files in the source directory
    const files = await fs.readdir(srcDir);

    for (const file of files) {
      const filePath = path.join(srcDir, file);
      const fileExt = path.extname(file).toLowerCase();

      // Ensure the file is an image
      if ([".jpg", ".jpeg", ".png", ".gif"].includes(fileExt)) {
        // Generate the thumbnail
        const thumbPath = path.join(thumbDir, file);
        await sharp(filePath).resize({ width: 350 }).toFile(thumbPath);

        // Generate the resized image (capped at 2000px wide)
        const resizedPath = path.join(resizedDir, file);
        await sharp(filePath)
          .resize({ width: 2000, withoutEnlargement: true })
          .toFile(resizedPath);

        console.log(`Processed ${file}`);
      }
    }
  } catch (err) {
    console.error("Error processing images", err);
  }
}

// Run the image processing function
processImages();
