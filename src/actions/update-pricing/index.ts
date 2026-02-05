"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { pricingTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updatePricingSchema } from "./schema";

export const updatePricingAction = actionClient
  .schema(updatePricingSchema)
  .action(async ({ parsedInput }) => {
    const precoValue = parseFloat(
      parsedInput.preco.trim() === "" ? "0" : parsedInput.preco
    );
    if (Number.isNaN(precoValue) || precoValue < 0) {
      return { success: false, error: "Preço inválido" };
    }

    const existing = await db
      .select({ id: pricingTable.id })
      .from(pricingTable)
      .where(eq(pricingTable.id, parsedInput.id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Precificação não encontrada" };
    }

    await db
      .update(pricingTable)
      .set({
        preco: String(precoValue),
        undMedidaVenda: parsedInput.undMedidaVenda,
        updatedAt: new Date(),
      })
      .where(eq(pricingTable.id, parsedInput.id));

    return { success: true };
  });
