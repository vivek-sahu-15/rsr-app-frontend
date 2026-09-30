import * as FileSystem from 'expo-file-system/legacy';

// Uploads an image directly to Cloudinary using an UNSIGNED upload preset,
// and returns the permanent secure_url. The backend never sees the image
// itself — it only ever stores this URL string.
//
// Setup required (one-time, free):
//   1. Sign up at cloudinary.com
//   2. Dashboard shows your "Cloud Name" — put it in .env as
//      EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
//   3. Settings → Upload → Upload presets → Add upload preset →
//      set Signing Mode to "Unsigned" → save → copy its name into .env as
//      EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
//
// "Unsigned" is what allows the upload straight from the app without your
// backend generating a signature first — fine for a project like this,
// since anyone with the preset name can only upload, not delete or manage
// your account.

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary is not configured — check EXPO_PUBLIC_CLOUDINARY_* in .env');
    }

    // expo-file-system builds the multipart request natively and reads the
    // file straight off disk. This sidesteps two known RN/Expo JS-level
    // issues: the older { uri, type, name } FormData trick throwing
    // "Unsupported FormData part implementation", and fetch(uri).blob()
    // sometimes producing a corrupted/empty blob that Cloudinary then
    // rejects as an "invalid image file" even though no error was thrown.
    const result = await FileSystem.uploadAsync(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        localUri,
        {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            mimeType: 'image/jpeg',
            parameters: { upload_preset: uploadPreset },
        }
    );

    if (result.status < 200 || result.status >= 300) {
        let message = 'Image upload failed';
        try {
            const parsed = JSON.parse(result.body);
            message = parsed?.error?.message || message;
        } catch {
            // Response body wasn't JSON — keep the generic message
        }
        throw new Error(message);
    }

    const data = JSON.parse(result.body);
    return data.secure_url as string;
}