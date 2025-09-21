import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

const getExtension = (file: File) => {
  const [, subtype] = file.type.split("/");
  if (!subtype) return "jpg";
  return subtype.split("+")[0] || "jpg";
};

const uploadFile = async (path: string, file: File) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || undefined,
  });
  const url = await getDownloadURL(snapshot.ref);
  return { url, path };
};

export const uploadReceiptPhoto = async (
  userId: string,
  receiptId: string,
  file: File
) => {
  const extension = getExtension(file);
  const path = `receipts/${userId}/${receiptId}-${Date.now()}.${extension}`;
  return uploadFile(path, file);
};

export const uploadServicePhoto = async (
  userId: string,
  expenseId: string,
  file: File
) => {
  const extension = getExtension(file);
  const path = `services/${userId}/${expenseId}-${Date.now()}.${extension}`;
  return uploadFile(path, file);
};

export const removeFromStorage = async (storagePath?: string | null) => {
  if (!storagePath) return;
  await deleteObject(ref(storage, storagePath));
};
