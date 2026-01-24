"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { subgroupsTable } from "@/db/schema";
import { createSubgroupSchema } from "./schema";
import { nanoid } from "nanoid";

export const createSubgroupAction = actionClient
  .schema(createSubgroupSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();

    await db.insert(subgroupsTable).values({
      id,
      cod: parsedInput.cod,
      nome: parsedInput.nome,
      groupId: parsedInput.groupId,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
