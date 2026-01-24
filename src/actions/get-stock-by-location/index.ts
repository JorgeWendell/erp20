"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  stockTable,
  productsTable,
  groupsTable,
  subgroupsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStockByLocationSchema } from "./schema";

export const getStockByLocationAction = actionClient
  .schema(getStockByLocationSchema)
  .action(async ({ parsedInput }) => {
    const rows = await db
      .select({
        id: stockTable.id,
        productId: productsTable.id,
        cod: productsTable.cod,
        nome: productsTable.nome,
        undMedida: productsTable.undMedida,
        grupoCod: groupsTable.cod,
        subgrupoCod: subgroupsTable.cod,
        quantity: stockTable.quantity,
      })
      .from(stockTable)
      .innerJoin(productsTable, eq(stockTable.productId, productsTable.id))
      .leftJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
      .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id))
      .where(eq(stockTable.locationId, parsedInput.locationId));

    const data = rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      cod:
        r.grupoCod && r.subgrupoCod
          ? `${r.grupoCod} - ${r.subgrupoCod} - ${r.cod}`
          : r.cod,
      produto: r.nome,
      undMedida: r.undMedida ?? "un",
      quantity: r.quantity ?? "0",
    }));

    return { success: true, data };
  });
