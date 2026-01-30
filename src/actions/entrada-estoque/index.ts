"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { stockTable, comprasTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { entradaEstoqueSchema } from "./schema";

export const entradaEstoqueAction = actionClient
  .schema(entradaEstoqueSchema)
  .action(async ({ parsedInput }) => {
    const now = new Date();
    const qtyToAdd = parseFloat(
      parsedInput.quantity.trim() === "" ? "0" : parsedInput.quantity
    );
    if (Number.isNaN(qtyToAdd) || qtyToAdd <= 0) {
      return { success: false, error: "Quantidade inválida" };
    }
    const quantityStr = String(qtyToAdd);

    const existing = await db
      .select({ id: stockTable.id, quantity: stockTable.quantity })
      .from(stockTable)
      .where(
        and(
          eq(stockTable.productId, parsedInput.productId),
          eq(stockTable.locationId, parsedInput.locationId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const currentQty = parseFloat(existing[0].quantity);
      const newQty = currentQty + qtyToAdd;
      await db
        .update(stockTable)
        .set({
          quantity: String(newQty),
          updatedAt: now,
        })
        .where(eq(stockTable.id, existing[0].id));
    } else {
      const id = nanoid();
      await db.insert(stockTable).values({
        id,
        productId: parsedInput.productId,
        locationId: parsedInput.locationId,
        quantity: quantityStr,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (parsedInput.compraId) {
      await db
        .update(comprasTable)
        .set({ status: "entregue", updatedAt: now })
        .where(eq(comprasTable.id, parsedInput.compraId));
    }

    return { success: true };
  });
