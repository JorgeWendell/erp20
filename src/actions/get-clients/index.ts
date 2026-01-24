"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { clientsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getClientsSchema } from "./schema";

export const getClientsAction = actionClient
  .schema(getClientsSchema)
  .action(async () => {
    const clients = await db.select().from(clientsTable).orderBy(desc(clientsTable.createdAt));

    return { success: true, data: clients };
  });
