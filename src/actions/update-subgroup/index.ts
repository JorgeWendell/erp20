"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { subgroupsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateSubgroupSchema } from "./schema";

export const updateSubgroupAction = actionClient
  .schema(updateSubgroupSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(subgroupsTable)
      .set({
        cod: parsedInput.cod,
        nome: parsedInput.nome,
        groupId: parsedInput.groupId,
        updatedAt: new Date(),
      })
      .where(eq(subgroupsTable.id, parsedInput.id));

    return { success: true };
  });
