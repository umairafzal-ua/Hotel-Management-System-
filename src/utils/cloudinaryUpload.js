import cloudinary from "../config/cloudinary.js";

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer  – file buffer from multer
 * @param {string} folder  – Cloudinary folder, e.g. "rooms"
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = (buffer, folder = "rooms") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [
                    { width: 1200, height: 800, crop: "limit" },
                    { quality: "auto", fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );
        stream.end(buffer);
    });
};

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error.message);
    }
};
