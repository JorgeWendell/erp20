"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable, groupsTable, subgroupsTable } from "@/db/schema";
import { and, desc, eq, ilike } from "drizzle-orm";
import { getProductsSchema } from "./schema";

export const getProductsAction = actionClient
  .schema(getProductsSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];
    if (parsedInput.cod?.trim()) {
      conditions.push(ilike(productsTable.cod, `%${parsedInput.cod.trim()}%`));
    }
    if (parsedInput.grupoId) {
      conditions.push(eq(productsTable.grupoId, parsedInput.grupoId));
    }
    if (parsedInput.subgrupoId) {
      conditions.push(eq(productsTable.subgrupoId, parsedInput.subgrupoId));
    }
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db
      .select({
        id: productsTable.id,
        cod: productsTable.cod,
        nome: productsTable.nome,
        undMedida: productsTable.undMedida,
        referencia1: productsTable.referencia1,
        referencia2: productsTable.referencia2,
        grupoId: productsTable.grupoId,
        grupoNome: groupsTable.nome,
        subgrupoId: productsTable.subgrupoId,
        subgrupoNome: subgroupsTable.nome,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .leftJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
      .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id));

    const products = whereClause
      ? await baseQuery.where(whereClause).orderBy(desc(productsTable.createdAt))
      : await baseQuery.orderBy(desc(productsTable.createdAt));

    return { success: true, data: products };
  });
