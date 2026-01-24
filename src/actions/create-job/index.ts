"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { jobTable } from "@/db/schema";
import { createJobSchema } from "./schema";
import { nanoid } from "nanoid";

export const createJobAction = actionClient
  .schema(createJobSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();

    await db.insert(jobTable).values({
      id,
      nome: parsedInput.nome,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
