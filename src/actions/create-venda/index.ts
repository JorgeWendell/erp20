"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { vendasTable, vendaItemsTable, stockTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createVendaSchema } from "./schema";

function generateCodigoVenda(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export const createVendaAction = actionClient
  .schema(createVendaSchema)
  .action(async ({ parsedInput }) => {
    const now = new Date();
    let codigo = generateCodigoVenda();
    for (let i = 0; i < 20; i++) {
      const existing = await db
        .select({ id: vendasTable.id })
        .from(vendasTable)
        .where(eq(vendasTable.codigo, codigo))
        .limit(1);
      if (existing.length === 0) break;
      codigo = generateCodigoVenda();
    }

    const total = parsedInput.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);

    const vendaId = nanoid();

    await db.insert(vendasTable).values({
      id: vendaId,
      codigo,
      clientId: parsedInput.clientId || null,
      locationId: parsedInput.locationId,
      total: String(total),
      observacoes: parsedInput.observacoes || null,
      temNota: parsedInput.temNota,
      status: "finalizada",
      createdAt: now,
      updatedAt: now,
    });

    for (const item of parsedInput.items) {
      const itemId = nanoid();
      await db.insert(vendaItemsTable).values({
        id: itemId,
        vendaId,
        productId: item.productId,
        quantity: item.quantity,
        undMedida: item.undMedida,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
        createdAt: now,
      });

      const existingStock = await db
        .select()
        .from(stockTable)
        .where(
          and(
            eq(stockTable.productId, item.productId),
            eq(stockTable.locationId, parsedInput.locationId)
          )
        )
        .limit(1);

      if (existingStock.length > 0) {
        const currentQty = parseFloat(existingStock[0].quantity);
        const qtyToRemove = parseFloat(item.quantity);
        const newQty = Math.max(0, currentQty - qtyToRemove);

        await db
          .update(stockTable)
          .set({
            quantity: String(newQty),
            updatedAt: now,
          })
          .where(eq(stockTable.id, existingStock[0].id));
      }
    }

    return { success: true, id: vendaId, codigo };
  });
