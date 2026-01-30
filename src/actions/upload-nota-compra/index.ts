"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { comprasTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { uploadNotaCompraSchema } from "./schema";

const UPLOAD_DIR = "uploads/compras";
const ALLOWED_EXT = [".pdf", ".png", ".jpg", ".jpeg"];

export const uploadNotaCompraAction = actionClient
  .schema(uploadNotaCompraSchema)
  .action(async ({ parsedInput }) => {
    const ext = path.extname(parsedInput.fileName).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return { success: false, error: "Tipo de arquivo não permitido. Use PDF ou imagem." };
    }

    const buffer = Buffer.from(parsedInput.fileBase64, "base64");
    const baseDir = path.join(process.cwd(), "public", UPLOAD_DIR);
    await mkdir(baseDir, { recursive: true });
    const safeName = `${parsedInput.compraId}${ext}`;
    const filePath = path.join(baseDir, safeName);
    await writeFile(filePath, buffer);

    const publicUrl = `/${UPLOAD_DIR}/${safeName}`;

    await db
      .update(comprasTable)
      .set({ notaFileUrl: publicUrl, updatedAt: new Date() })
      .where(eq(comprasTable.id, parsedInput.compraId));

    return { success: true, path: publicUrl };
  });
