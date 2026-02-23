import { ref, uploadBytes, getDownloadURL, StorageReference, FirebaseStorage } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param storage The Firebase Storage instance.
 * @param path The path where the file should be stored (e.g., 'submissions/user123/photo.jpg').
 * @param file The file or blob to upload.
 * @returns A promise that resolves to the download URL.
 */
export async function uploadFile(
  storage: FirebaseStorage,
  path: string,
  file: Blob | File
): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
