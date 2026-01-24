"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateSupplierSchema } from "./schema";

export const updateSupplierAction = actionClient
  .schema(updateSupplierSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(suppliersTable)
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
      .where(eq(suppliersTable.id, parsedInput.id));

    return { success: true };
  });
