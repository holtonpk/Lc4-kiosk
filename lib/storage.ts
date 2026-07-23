import {getStorage, ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";
import {app} from "@/lib/firebase";

const storage = getStorage(app);

export async function uploadCarImage(carId: string, file: File): Promise<string> {
  const path = `cars/${carId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadCarVideo(carId: string, file: File): Promise<string> {
  const path = `cars/${carId}/videos/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteCarFile(url: string): Promise<void> {
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // File may already be gone or not a storage URL — safe to ignore.
  }
}
