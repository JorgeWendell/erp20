"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { comprasTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rejectCompraSchema } from "./schema";

export const rejectCompraAction = actionClient
  .schema(rejectCompraSchema)
  .action(async ({ parsedInput }) => {
    const compras = await db
      .select({ status: comprasTable.status })
      .from(comprasTable)
      .where(eq(comprasTable.id, parsedInput.id))
      .limit(1);

    if (compras.length === 0) {
      return { success: false, error: "Compra não encontrada" };
    }

    if (compras[0].status !== "pendente") {
      return { success: false, error: "Apenas compras pendentes podem ser reprovadas" };
    }

    await db
      .update(comprasTable)
      .set({ status: "reprovado", updatedAt: new Date() })
      .where(eq(comprasTable.id, parsedInput.id));

    return { success: true };
  });
