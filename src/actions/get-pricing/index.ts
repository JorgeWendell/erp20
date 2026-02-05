"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import {
  pricingTable,
  productsTable,
  locationsTable,
  stockTable,
  groupsTable,
  subgroupsTable,
} from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { getPricingSchema } from "./schema";

export const getPricingAction = actionClient
  .schema(getPricingSchema)
  .action(async ({ parsedInput }) => {
    const conditions = [];
    if (parsedInput.locationId) {
      conditions.push(eq(pricingTable.locationId, parsedInput.locationId));
    }
    if (parsedInput.productId) {
      conditions.push(eq(pricingTable.productId, parsedInput.productId));
    }
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db
      .select({
        id: pricingTable.id,
        productId: pricingTable.productId,
        locationId: pricingTable.locationId,
        preco: pricingTable.preco,
        undMedidaVenda: pricingTable.undMedidaVenda,
        productCod: productsTable.cod,
        productNome: productsTable.nome,
        locationNome: locationsTable.nome,
        grupoCod: groupsTable.cod,
        subgrupoCod: subgroupsTable.cod,
        createdAt: pricingTable.createdAt,
        updatedAt: pricingTable.updatedAt,
      })
      .from(pricingTable)
      .innerJoin(productsTable, eq(pricingTable.productId, productsTable.id))
      .innerJoin(locationsTable, eq(pricingTable.locationId, locationsTable.id))
      .leftJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
      .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id));

    const pricing = whereClause
      ? await baseQuery.where(whereClause)
      : await baseQuery;

    return { success: true, data: pricing };
  });
