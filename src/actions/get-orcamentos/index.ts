"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  orcamentosTable,
  clientsTable,
  locationsTable,
} from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import { getOrcamentosSchema } from "./schema";

export const getOrcamentosAction = actionClient
  .schema(getOrcamentosSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];
    if (parsedInput.status) {
      conditions.push(eq(orcamentosTable.status, parsedInput.status));
    }
    if (parsedInput.clientId) {
      conditions.push(eq(orcamentosTable.clientId, parsedInput.clientId));
    }
    if (parsedInput.locationId) {
      conditions.push(eq(orcamentosTable.locationId, parsedInput.locationId));
    }
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db
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
        vendaId: orcamentosTable.vendaId,
        createdAt: orcamentosTable.createdAt,
        updatedAt: orcamentosTable.updatedAt,
      })
      .from(orcamentosTable)
      .innerJoin(clientsTable, eq(orcamentosTable.clientId, clientsTable.id))
      .innerJoin(locationsTable, eq(orcamentosTable.locationId, locationsTable.id));

    let orcamentos = whereClause
      ? await baseQuery.where(whereClause).orderBy(desc(orcamentosTable.createdAt))
      : await baseQuery.orderBy(desc(orcamentosTable.createdAt));

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    orcamentos = orcamentos.map((orc) => {
      const validadeDate = new Date(orc.validade);
      validadeDate.setHours(0, 0, 0, 0);

      if (
        orc.status === "pendente" &&
        validadeDate < hoje
      ) {
        return { ...orc, status: "vencido" as const };
      }
      return orc;
    });

    return { success: true, data: orcamentos };
  });
