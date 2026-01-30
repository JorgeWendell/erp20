"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { comprasTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCompraSchema } from "./schema";

export const updateCompraAction = actionClient
  .schema(updateCompraSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(comprasTable)
      .set({
        supplierId: parsedInput.supplierId,
        locationId: parsedInput.locationId,
        quantity: parsedInput.quantity,
        undMedida: parsedInput.undMedida,
        temNota: parsedInput.temNota,
        notaFileUrl: parsedInput.temNota ? parsedInput.notaFileUrl ?? null : null,
        updatedAt: new Date(),
      })
      .where(eq(comprasTable.id, parsedInput.id));

    return { success: true };
  });
