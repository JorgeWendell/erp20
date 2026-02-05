"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { pricingTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createPricingSchema } from "./schema";

export const createPricingAction = actionClient
  .schema(createPricingSchema)
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
      .where(
        and(
          eq(pricingTable.productId, parsedInput.productId),
          eq(pricingTable.locationId, parsedInput.locationId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "Já existe uma precificação para este produto neste local",
      };
    }

    const id = nanoid();
    const now = new Date();

    await db.insert(pricingTable).values({
      id,
      productId: parsedInput.productId,
      locationId: parsedInput.locationId,
      preco: String(precoValue),
      undMedidaVenda: parsedInput.undMedidaVenda,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
