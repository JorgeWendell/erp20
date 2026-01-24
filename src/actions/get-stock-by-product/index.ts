"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { stockTable, locationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStockByProductSchema } from "./schema";

export const getStockByProductAction = actionClient
  .schema(getStockByProductSchema)
  .action(async ({ parsedInput }) => {
    const rows = await db
      .select({
        id: stockTable.id,
        productId: stockTable.productId,
        locationId: stockTable.locationId,
        locationNome: locationsTable.nome,
        quantity: stockTable.quantity,
      })
      .from(stockTable)
      .leftJoin(locationsTable, eq(stockTable.locationId, locationsTable.id))
      .where(eq(stockTable.productId, parsedInput.productId));

    return { success: true, data: rows };
  });
