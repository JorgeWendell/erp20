"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { comprasTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCompraSchema } from "./schema";
import { nanoid } from "nanoid";

function generateCodigoCompra(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export const createCompraAction = actionClient
  .schema(createCompraSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();
    let codigo = generateCodigoCompra();
    for (let i = 0; i < 20; i++) {
      const existing = await db
        .select({ id: comprasTable.id })
        .from(comprasTable)
        .where(eq(comprasTable.codigo, codigo))
        .limit(1);
      if (existing.length === 0) break;
      codigo = generateCodigoCompra();
    }

    await db.insert(comprasTable).values({
      id,
      codigo,
      productId: parsedInput.productId,
      supplierId: parsedInput.supplierId,
      locationId: parsedInput.locationId,
      quantity: parsedInput.quantity,
      undMedida: parsedInput.undMedida,
      temNota: parsedInput.temNota,
      notaFileUrl: parsedInput.temNota ? parsedInput.notaFileUrl ?? null : null,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id, codigo };
  });
