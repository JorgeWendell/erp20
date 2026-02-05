"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { orcamentosTable, orcamentoItemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { updateOrcamentoSchema } from "./schema";

export const updateOrcamentoAction = actionClient
  .schema(updateOrcamentoSchema)
  .action(async ({ parsedInput }) => {
    const existing = await db
      .select()
      .from(orcamentosTable)
      .where(eq(orcamentosTable.id, parsedInput.id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    const orcamento = existing[0];
    if (orcamento.status !== "pendente") {
      return {
        success: false,
        error: "Apenas orçamentos pendentes podem ser editados",
      };
    }

    const total = parsedInput.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);

    const validadeDate = new Date(parsedInput.validade);
    const now = new Date();

    await db
      .update(orcamentosTable)
      .set({
        clientId: parsedInput.clientId,
        total: String(total),
        observacoes: parsedInput.observacoes || null,
        validade: validadeDate,
        temNota: parsedInput.temNota,
        updatedAt: now,
      })
      .where(eq(orcamentosTable.id, parsedInput.id));

    await db
      .delete(orcamentoItemsTable)
      .where(eq(orcamentoItemsTable.orcamentoId, parsedInput.id));

    for (const item of parsedInput.items) {
      const itemId = nanoid();
      await db.insert(orcamentoItemsTable).values({
        id: itemId,
        orcamentoId: parsedInput.id,
        productId: item.productId,
        quantity: item.quantity,
        undMedida: item.undMedida,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
        createdAt: now,
      });
    }

    return { success: true };
  });
