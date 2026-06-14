/**
 * @file cloudinaryUpload.js
 * @description Helper to upload file buffers (from Multer memory storage) to Cloudinary.
 * Returns the secure URL for storage in the database.
 */
import cloudinary from "../config/cloudinary.js";

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from Multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadToCloudinary = (fileBuffer, folder = "peerlance") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};
