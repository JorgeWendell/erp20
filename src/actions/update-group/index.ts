"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { groupsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateGroupSchema } from "./schema";

export const updateGroupAction = actionClient
  .schema(updateGroupSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(groupsTable)
      .set({
        cod: parsedInput.cod,
        nome: parsedInput.nome,
        updatedAt: new Date(),
      })
      .where(eq(groupsTable.id, parsedInput.id));

    return { success: true };
  });
