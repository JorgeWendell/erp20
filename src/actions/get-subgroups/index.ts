"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { subgroupsTable, groupsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSubgroupsSchema } from "./schema";

export const getSubgroupsAction = actionClient
  .schema(getSubgroupsSchema)
  .action(async () => {
    const subgroups = await db
      .select({
        id: subgroupsTable.id,
        cod: subgroupsTable.cod,
        nome: subgroupsTable.nome,
        groupId: subgroupsTable.groupId,
        groupNome: groupsTable.nome,
        createdAt: subgroupsTable.createdAt,
        updatedAt: subgroupsTable.updatedAt,
      })
      .from(subgroupsTable)
      .leftJoin(groupsTable, eq(subgroupsTable.groupId, groupsTable.id))
      .orderBy(desc(subgroupsTable.createdAt));

    return { success: true, data: subgroups };
  });
