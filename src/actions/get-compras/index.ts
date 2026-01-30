"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  comprasTable,
  productsTable,
  groupsTable,
  subgroupsTable,
  suppliersTable,
  locationsTable,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getComprasSchema } from "./schema";

export const getComprasAction = actionClient
  .schema(getComprasSchema)
  .action(async ({ parsedInput }) => {
    const whereClause = parsedInput.status
      ? eq(comprasTable.status, parsedInput.status)
      : undefined;

    const baseQuery = db
      .select({
        id: comprasTable.id,
        codigo: comprasTable.codigo,
        productId: comprasTable.productId,
        productCod: productsTable.cod,
        productNome: productsTable.nome,
        grupoCod: groupsTable.cod,
        subgrupoCod: subgroupsTable.cod,
        supplierId: comprasTable.supplierId,
        supplierNome: suppliersTable.nome,
        locationId: comprasTable.locationId,
        locationNome: locationsTable.nome,
        quantity: comprasTable.quantity,
        undMedida: comprasTable.undMedida,
        temNota: comprasTable.temNota,
        notaFileUrl: comprasTable.notaFileUrl,
        status: comprasTable.status,
        createdAt: comprasTable.createdAt,
        updatedAt: comprasTable.updatedAt,
      })
      .from(comprasTable)
      .innerJoin(productsTable, eq(comprasTable.productId, productsTable.id))
      .innerJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
      .innerJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id))
      .innerJoin(suppliersTable, eq(comprasTable.supplierId, suppliersTable.id))
      .innerJoin(locationsTable, eq(comprasTable.locationId, locationsTable.id));

    const rows = whereClause
      ? await baseQuery.where(whereClause).orderBy(desc(comprasTable.createdAt))
      : await baseQuery.orderBy(desc(comprasTable.createdAt));

    return { success: true, data: rows };
  });
