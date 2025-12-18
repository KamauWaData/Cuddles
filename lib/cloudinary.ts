// lib/cloudinary.ts
// Cloudinary upload utility for React Native
import { Platform } from 'react-native';

const CLOUDINARY_URL = (process.env && process.env.CLOUDINARY_URL) || 'https://api.cloudinary.com/v1_1/dre7tjrrp/upload';
const UPLOAD_PRESET = 'my_avatar_preset';

export async function uploadToCloudinary(uri: string): Promise<string> {
  const formData = new FormData();
  // Cloudinary expects 'file' field
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload failed');
  return data.secure_url;
}

// Optionally, add delete logic if you store public_id
export async function deleteFromCloudinary(publicId: string, apiKey: string, apiSecret: string) {
  // Not implemented: requires backend or signed request
}
