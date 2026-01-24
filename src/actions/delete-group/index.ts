"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { groupsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteGroupSchema } from "./schema";

export const deleteGroupAction = actionClient
  .schema(deleteGroupSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(groupsTable).where(eq(groupsTable.id, parsedInput.id));

    return { success: true };
  });
