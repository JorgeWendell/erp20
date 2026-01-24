"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable } from "@/db/schema";
import { createProductSchema } from "./schema";
import { nanoid } from "nanoid";

export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();

    await db.insert(productsTable).values({
      id,
      cod: parsedInput.cod,
      grupoId: parsedInput.grupoId,
      subgrupoId: parsedInput.subgrupoId,
      nome: parsedInput.nome,
      undMedida: parsedInput.undMedida,
      referencia1: parsedInput.referencia1 || null,
      referencia2: parsedInput.referencia2 || null,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
