"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteSupplierSchema } from "./schema";

export const deleteSupplierAction = actionClient
  .schema(deleteSupplierSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(suppliersTable).where(eq(suppliersTable.id, parsedInput.id));

    return { success: true };
  });
