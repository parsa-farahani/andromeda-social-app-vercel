// utils/media/storage.ts
import { put, del } from "@vercel/blob";

const CONTENT_TYPES: Record<string, string> = {
   jpg: "image/jpeg",
   png: "image/png",
   gif: "image/gif",
   webp: "image/webp",
};

export async function saveImage(
   buffer: Buffer,
   fileName: string,   // safeFileName() output
   ext: string,        // detectImage() output
   folder: "users" | "posts" | "comments"
) {

   console.log("Blob token exists:", Boolean(process.env.BLOB_READ_WRITE_TOKEN));

   const blob = await put(`${folder}/${fileName}`, buffer, {
      access: "public",
      contentType: CONTENT_TYPES[ext],
      addRandomSuffix: false,
   });

   // Save this URL in DB
   return blob.url;
}

export async function deleteImage(url?: string | null) {
   if (!url || !url.startsWith("https://")) return;
   await del(url).catch(() => {});
}