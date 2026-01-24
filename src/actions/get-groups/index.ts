"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { groupsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getGroupsSchema } from "./schema";

export const getGroupsAction = actionClient
  .schema(getGroupsSchema)
  .action(async () => {
    const groups = await db.select().from(groupsTable).orderBy(desc(groupsTable.createdAt));

    return { success: true, data: groups };
  });
