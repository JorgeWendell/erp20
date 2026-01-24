"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { clientsTable } from "@/db/schema";
import { createClientSchema } from "./schema";
import { nanoid } from "nanoid";

export const createClientAction = actionClient
  .schema(createClientSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();

    await db.insert(clientsTable).values({
      id,
      nome: parsedInput.nome,
      email: parsedInput.email || null,
      telefone: parsedInput.telefone || null,
      cpfCnpj: parsedInput.cpfCnpj || null,
      endereco: parsedInput.endereco || null,
      numero: parsedInput.numero || null,
      cidade: parsedInput.cidade || null,
      estado: parsedInput.estado || null,
      cep: parsedInput.cep || null,
      isActive: parsedInput.isActive,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id };
  });
