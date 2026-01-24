"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { subgroupsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteSubgroupSchema } from "./schema";

export const deleteSubgroupAction = actionClient
  .schema(deleteSubgroupSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(subgroupsTable).where(eq(subgroupsTable.id, parsedInput.id));

    return { success: true };
  });
