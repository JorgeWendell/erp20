"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { orcamentosTable, orcamentoItemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createOrcamentoSchema } from "./schema";

function generateCodigoOrcamento(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export const createOrcamentoAction = actionClient
  .schema(createOrcamentoSchema)
  .action(async ({ parsedInput }) => {
    const now = new Date();
    let codigo = generateCodigoOrcamento();
    for (let i = 0; i < 20; i++) {
      const existing = await db
        .select({ id: orcamentosTable.id })
        .from(orcamentosTable)
        .where(eq(orcamentosTable.codigo, codigo))
        .limit(1);
      if (existing.length === 0) break;
      codigo = generateCodigoOrcamento();
    }

    const total = parsedInput.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);

    const orcamentoId = nanoid();
    const validadeDate = new Date(parsedInput.validade);

    await db.insert(orcamentosTable).values({
      id: orcamentoId,
      codigo,
      clientId: parsedInput.clientId,
      locationId: parsedInput.locationId,
      total: String(total),
      observacoes: parsedInput.observacoes || null,
      validade: validadeDate,
      temNota: parsedInput.temNota,
      status: "pendente",
      createdAt: now,
      updatedAt: now,
    });

    for (const item of parsedInput.items) {
      const itemId = nanoid();
      await db.insert(orcamentoItemsTable).values({
        id: itemId,
        orcamentoId,
        productId: item.productId,
        quantity: item.quantity,
        undMedida: item.undMedida,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
        createdAt: now,
      });
    }

    return { success: true, id: orcamentoId, codigo };
  });
