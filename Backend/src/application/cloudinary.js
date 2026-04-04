import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import 'dotenv/config';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath, folderName, isVideo = false) => {
    try {
        console.log(`☁️ Mengupload ke Cloudinary...`);
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: `jkt48_photos/${folderName}`, 
            resource_type: isVideo ? 'video' : 'image'
        });
        
        // Hapus file lokal setelah berhasil upload agar server Railway tidak penuh
        fs.unlinkSync(localFilePath); 
        console.log(`✅ Upload selesai: ${result.secure_url}`);
        
        return result.secure_url
    } catch (error) {
        console.error("❌ Gagal upload ke Cloudinary:", error);
        throw error;
    }
};