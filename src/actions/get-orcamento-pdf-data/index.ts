"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  orcamentosTable,
  orcamentoItemsTable,
  clientsTable,
  locationsTable,
  productsTable,
  groupsTable,
  subgroupsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrcamentoPdfDataSchema } from "./schema";

export const getOrcamentoPdfDataAction = actionClient
  .schema(getOrcamentoPdfDataSchema)
  .action(async ({ parsedInput }) => {
    try {
      if (!parsedInput.orcamentoId) {
        return { success: false, error: "ID do orçamento é obrigatório" };
      }

      const orcamento = await db
        .select({
          id: orcamentosTable.id,
          codigo: orcamentosTable.codigo,
          clientId: orcamentosTable.clientId,
          clientNome: clientsTable.nome,
          locationId: orcamentosTable.locationId,
          locationNome: locationsTable.nome,
          total: orcamentosTable.total,
          observacoes: orcamentosTable.observacoes,
          validade: orcamentosTable.validade,
          temNota: orcamentosTable.temNota,
          status: orcamentosTable.status,
          createdAt: orcamentosTable.createdAt,
          updatedAt: orcamentosTable.updatedAt,
        })
        .from(orcamentosTable)
        .innerJoin(clientsTable, eq(orcamentosTable.clientId, clientsTable.id))
        .innerJoin(locationsTable, eq(orcamentosTable.locationId, locationsTable.id))
        .where(eq(orcamentosTable.id, parsedInput.orcamentoId))
        .limit(1);

      if (orcamento.length === 0) {
        return { success: false, error: "Orçamento não encontrado" };
      }

      const items = await db
        .select({
          id: orcamentoItemsTable.id,
          productId: productsTable.id,
          productCod: productsTable.cod,
          productNome: productsTable.nome,
          grupoCod: groupsTable.cod,
          subgrupoCod: subgroupsTable.cod,
          quantity: orcamentoItemsTable.quantity,
          undMedida: orcamentoItemsTable.undMedida,
          precoUnitario: orcamentoItemsTable.precoUnitario,
          subtotal: orcamentoItemsTable.subtotal,
        })
        .from(orcamentoItemsTable)
        .innerJoin(productsTable, eq(orcamentoItemsTable.productId, productsTable.id))
        .leftJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
        .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id))
        .where(eq(orcamentoItemsTable.orcamentoId, parsedInput.orcamentoId));

      return { success: true, data: { ...orcamento[0], items } };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Erro ao buscar orçamento";
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
