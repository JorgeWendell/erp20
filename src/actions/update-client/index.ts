"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { clientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateClientSchema } from "./schema";

export const updateClientAction = actionClient
  .schema(updateClientSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(clientsTable)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(clientsTable.id, parsedInput.id));

    return { success: true };
  });
