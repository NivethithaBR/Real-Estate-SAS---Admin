const cloudinary = require("../config/cloudinary.config");

const uploadToCloudinary = (folder, file, resource_type = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type,
        folder: `seemanRealestate/${folder}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("Cloudinary upload result:", result);
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted:", result);
    return result;
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};
module.exports = { uploadToCloudinary, deleteFromCloudinary };
