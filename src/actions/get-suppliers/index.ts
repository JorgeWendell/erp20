"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSuppliersSchema } from "./schema";

export const getSuppliersAction = actionClient
  .schema(getSuppliersSchema)
  .action(async () => {
    const suppliers = await db.select().from(suppliersTable).orderBy(desc(suppliersTable.createdAt));

    return { success: true, data: suppliers };
  });
