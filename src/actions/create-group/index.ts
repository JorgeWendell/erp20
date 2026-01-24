"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { groupsTable } from "@/db/schema";
import { createGroupSchema } from "./schema";
import { nanoid } from "nanoid";

export const createGroupAction = actionClient
  .schema(createGroupSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();

    await db.insert(groupsTable).values({
      id,
      cod: parsedInput.cod,
      nome: parsedInput.nome,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
