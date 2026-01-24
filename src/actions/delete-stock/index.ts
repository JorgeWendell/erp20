"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { stockTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteStockSchema } from "./schema";

export const deleteStockAction = actionClient
  .schema(deleteStockSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(stockTable).where(eq(stockTable.id, parsedInput.id));
    return { success: true };
  });
