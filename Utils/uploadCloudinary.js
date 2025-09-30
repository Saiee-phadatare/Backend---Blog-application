const cloudinary = require("./Cloudinary");

const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(fileBuffer);
  });
};

module.exports = {
    uploadToCloudinary
}
