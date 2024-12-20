import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    timeout: 6000000
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile_pictures",
        format: async (req, file) => "jpg",  
        public_id: (req, file) => file.originalname.split('.')[0],
    },
});

const upload = multer({ storage });

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; 

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(localFilePath);  
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);  
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
};

export { upload };
