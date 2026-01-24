"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { subgroupsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSubgroupsByGroupSchema } from "./schema";

export const getSubgroupsByGroupAction = actionClient
  .schema(getSubgroupsByGroupSchema)
  .action(async ({ parsedInput }) => {
    const subgroups = await db
      .select()
      .from(subgroupsTable)
      .where(eq(subgroupsTable.groupId, parsedInput.groupId));

    return { success: true, data: subgroups };
  });
