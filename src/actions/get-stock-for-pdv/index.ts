"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  stockTable,
  productsTable,
  groupsTable,
  subgroupsTable,
  pricingTable,
} from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { getStockForPdvSchema } from "./schema";

export const getStockForPdvAction = actionClient
  .schema(getStockForPdvSchema)
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
        preco: pricingTable.preco,
        undMedidaVenda: pricingTable.undMedidaVenda,
      })
      .from(stockTable)
      .innerJoin(productsTable, eq(stockTable.productId, productsTable.id))
      .leftJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
      .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id))
      .leftJoin(
        pricingTable,
        and(
          eq(pricingTable.productId, productsTable.id),
          eq(pricingTable.locationId, parsedInput.locationId)
        )
      )
      .where(
        and(
          eq(stockTable.locationId, parsedInput.locationId),
          gt(stockTable.quantity, "0")
        )
      );

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
      preco: r.preco ?? null,
      undMedidaVenda: r.undMedidaVenda ?? r.undMedida ?? "un",
    }));

    return { success: true, data };
  });
