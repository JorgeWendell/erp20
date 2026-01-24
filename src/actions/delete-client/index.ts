"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { clientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteClientSchema } from "./schema";

export const deleteClientAction = actionClient
  .schema(deleteClientSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(clientsTable).where(eq(clientsTable.id, parsedInput.id));

    return { success: true };
  });
