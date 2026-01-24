"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateProductSchema } from "./schema";

export const updateProductAction = actionClient
  .schema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(productsTable)
      .set({
        cod: parsedInput.cod,
        grupoId: parsedInput.grupoId,
        subgrupoId: parsedInput.subgrupoId,
        nome: parsedInput.nome,
        undMedida: parsedInput.undMedida,
        referencia1: parsedInput.referencia1 || null,
        referencia2: parsedInput.referencia2 || null,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, parsedInput.id));

    return { success: true };
  });
