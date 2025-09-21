const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Impossible de lire le fichier"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Erreur de lecture du fichier"));
    reader.readAsDataURL(file);
  });
};

export const uploadReceiptPhoto = async (
  _userId: string | number | null | undefined,
  _receiptId: string,
  file: File
) => {
  const dataUrl = await fileToDataUrl(file);
  return { url: dataUrl, path: null as string | null };
};

export const uploadServicePhoto = async (
  _userId: string | number | null | undefined,
  _expenseId: string,
  file: File
) => {
  const dataUrl = await fileToDataUrl(file);
  return { url: dataUrl, path: null as string | null };
};

export const removeFromStorage = async (_storagePath?: string | null) => {
  return Promise.resolve();
};
