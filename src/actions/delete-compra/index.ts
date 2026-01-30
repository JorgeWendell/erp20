"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { comprasTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteCompraSchema } from "./schema";

export const deleteCompraAction = actionClient
  .schema(deleteCompraSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(comprasTable).where(eq(comprasTable.id, parsedInput.id));

    return { success: true };
  });
