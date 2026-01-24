"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteProductSchema } from "./schema";

export const deleteProductAction = actionClient
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(productsTable).where(eq(productsTable.id, parsedInput.id));

    return { success: true };
  });
