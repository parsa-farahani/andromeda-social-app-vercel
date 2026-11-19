// utils/media/storage.ts
import { put, del } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const storage = process.env.STORAGE_DRIVER ?? "local";


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

   if (storage === 'vercel') {

      const blob = await put(`${folder}/${fileName}`, buffer, {
         access: "public",
         contentType: CONTENT_TYPES[ext],
         addRandomSuffix: false,
      });
   
      // Save this URL in DB
      return blob.url;
   }
   else if (storage === 'local') {

      try {
         
         const folderPath = path.join( process.cwd(), 'uploads', 'images', folder );
   
         await mkdir(folderPath, { recursive: true });
   
         const imgPath = path.join( folderPath, fileName );
   
         await writeFile(
            imgPath,
            buffer
         )
   
         return `/api/files/${folder}/${fileName}`;

      } catch (error) {
         console.log('🔴 Error - saveImage -> ', error);
         return "";
      }

   }

   return "";
}



export async function deleteImage(imgDBUrl?: string | null) {


   if (storage === 'vercel') {

      if (!imgDBUrl || !imgDBUrl.startsWith("https://")) return;
      await del(imgDBUrl).catch(() => {});
   }
   else if (storage === 'local') {

      const allowedBase = path.join("/api", "files") + path.sep;

      if (!imgDBUrl || !imgDBUrl.startsWith(allowedBase)) return;
      
      const imgUrlLocalPart = (imgDBUrl.split('/').slice(3)).join("/");
      
      if (!imgUrlLocalPart) return;

      const filePath = path.join( process.cwd(), 'uploads', 'images', imgUrlLocalPart)

      await unlink(
         filePath
      )
      .catch((error) => {
         console.error('🔴 Error - deleteImage:', error);
      })
   }
   
}