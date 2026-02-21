import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your environment variable.
// This automatically uses the CLOUDINARY_URL from your .env file.
cloudinary.config({
  secure: true
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  try {
    // Convert the file to a buffer to prepare it for uploading.
    const fileBuffer = await file.arrayBuffer();
    const mime = file.type;
    const encoding = 'base64';
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

    // Use the Cloudinary SDK to upload the file.
    // The 'upload' function returns a promise that resolves with the upload result.
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'lenslock-avatars', // Optional: Organizes uploads into a specific folder.
    });

    // Return the secure URL of the uploaded image.
    return NextResponse.json({ url: result.secure_url }, { status: 200 });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: 'Upload to Cloudinary failed.' }, { status: 500 });
  }
}
