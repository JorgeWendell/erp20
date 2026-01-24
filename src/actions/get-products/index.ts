"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { productsTable, groupsTable, subgroupsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getProductsSchema } from "./schema";

export const getProductsAction = actionClient
  .schema(getProductsSchema)
  .action(async () => {
    const products = await db
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
      .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id))
      .orderBy(desc(productsTable.createdAt));

    return { success: true, data: products };
  });
