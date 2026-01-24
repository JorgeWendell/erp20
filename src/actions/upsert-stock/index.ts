"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { stockTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { upsertStockSchema } from "./schema";

export const upsertStockAction = actionClient
  .schema(upsertStockSchema)
  .action(async ({ parsedInput }) => {
    const now = new Date();
    const qty = parsedInput.quantity.trim() === "" ? "0" : parsedInput.quantity;

    const existing = await db
      .select({ id: stockTable.id })
      .from(stockTable)
      .where(
        and(
          eq(stockTable.productId, parsedInput.productId),
          eq(stockTable.locationId, parsedInput.locationId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(stockTable)
        .set({ quantity: qty, updatedAt: now })
        .where(eq(stockTable.id, existing[0].id));
      return { success: true, id: existing[0].id };
    }

    const id = nanoid();
    await db.insert(stockTable).values({
      id,
      productId: parsedInput.productId,
      locationId: parsedInput.locationId,
      quantity: qty,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, id };
  });
