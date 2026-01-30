"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { comprasTable, stockTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { approveCompraSchema } from "./schema";

export const approveCompraAction = actionClient
  .schema(approveCompraSchema)
  .action(async ({ parsedInput }) => {
    const compras = await db
      .select()
      .from(comprasTable)
      .where(eq(comprasTable.id, parsedInput.id))
      .limit(1);

    if (compras.length === 0) {
      return { success: false, error: "Compra não encontrada" };
    }

    const compra = compras[0];
    if (compra.status !== "pendente") {
      return { success: false, error: "Apenas compras pendentes podem ser aprovadas" };
    }

    await db
      .update(comprasTable)
      .set({ status: "aprovado", updatedAt: new Date() })
      .where(eq(comprasTable.id, parsedInput.id));

    const existingStock = await db
      .select()
      .from(stockTable)
      .where(
        and(
          eq(stockTable.productId, compra.productId),
          eq(stockTable.locationId, compra.locationId)
        )
      )
      .limit(1);

    const qty = parseFloat(compra.quantity);
    const now = new Date();

    if (existingStock.length > 0) {
      const current = parseFloat(existingStock[0].quantity);
      await db
        .update(stockTable)
        .set({
          quantity: String(current + qty),
          updatedAt: now,
        })
        .where(eq(stockTable.id, existingStock[0].id));
    } else {
      const { nanoid } = await import("nanoid");
      await db.insert(stockTable).values({
        id: nanoid(),
        productId: compra.productId,
        locationId: compra.locationId,
        quantity: compra.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  });
