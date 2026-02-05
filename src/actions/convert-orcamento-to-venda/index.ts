"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  orcamentosTable,
  orcamentoItemsTable,
  vendasTable,
  vendaItemsTable,
  stockTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { convertOrcamentoToVendaSchema } from "./schema";

function generateCodigoVenda(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export const convertOrcamentoToVendaAction = actionClient
  .schema(convertOrcamentoToVendaSchema)
  .action(async ({ parsedInput }) => {
    const orcamento = await db
      .select()
      .from(orcamentosTable)
      .where(eq(orcamentosTable.id, parsedInput.id))
      .limit(1);

    if (orcamento.length === 0) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    const orc = orcamento[0];
    if (orc.status !== "aprovado") {
      return {
        success: false,
        error: "Apenas orçamentos aprovados podem ser convertidos em venda",
      };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validadeDate = new Date(orc.validade);
    validadeDate.setHours(0, 0, 0, 0);

    if (validadeDate < hoje) {
      return {
        success: false,
        error: "Não é possível converter orçamento vencido",
      };
    }

    const items = await db
      .select()
      .from(orcamentoItemsTable)
      .where(eq(orcamentoItemsTable.orcamentoId, parsedInput.id));

    for (const item of items) {
      const existingStock = await db
        .select()
        .from(stockTable)
        .where(
          and(
            eq(stockTable.productId, item.productId),
            eq(stockTable.locationId, orc.locationId)
          )
        )
        .limit(1);

      if (existingStock.length === 0) {
        return {
          success: false,
          error: `Produto sem estoque disponível no local selecionado`,
        };
      }

      const stockQty = parseFloat(existingStock[0].quantity);
      const itemQty = parseFloat(item.quantity);
      if (stockQty < itemQty) {
        return {
          success: false,
          error: `Estoque insuficiente para o produto`,
        };
      }
    }

    const now = new Date();
    let codigo = generateCodigoVenda();
    for (let i = 0; i < 20; i++) {
      const existing = await db
        .select({ id: vendasTable.id })
        .from(vendasTable)
        .where(eq(vendasTable.codigo, codigo))
        .limit(1);
      if (existing.length === 0) break;
      codigo = generateCodigoVenda();
    }

    const vendaId = nanoid();

    await db.insert(vendasTable).values({
      id: vendaId,
      codigo,
      clientId: orc.clientId,
      locationId: orc.locationId,
      total: orc.total,
      observacoes: orc.observacoes,
      temNota: orc.temNota,
      status: "finalizada",
      createdAt: now,
      updatedAt: now,
    });

    for (const item of items) {
      const itemId = nanoid();
      await db.insert(vendaItemsTable).values({
        id: itemId,
        vendaId,
        productId: item.productId,
        quantity: item.quantity,
        undMedida: item.undMedida,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
        createdAt: now,
      });

      const existingStock = await db
        .select()
        .from(stockTable)
        .where(
          and(
            eq(stockTable.productId, item.productId),
            eq(stockTable.locationId, orc.locationId)
          )
        )
        .limit(1);

      if (existingStock.length > 0) {
        const currentQty = parseFloat(existingStock[0].quantity);
        const qtyToRemove = parseFloat(item.quantity);
        const newQty = Math.max(0, currentQty - qtyToRemove);

        await db
          .update(stockTable)
          .set({
            quantity: String(newQty),
            updatedAt: now,
          })
          .where(eq(stockTable.id, existingStock[0].id));
      }
    }

    await db
      .update(orcamentosTable)
      .set({
        status: "convertido",
        vendaId,
        updatedAt: now,
      })
      .where(eq(orcamentosTable.id, parsedInput.id));

    return { success: true, id: vendaId, codigo };
  });
