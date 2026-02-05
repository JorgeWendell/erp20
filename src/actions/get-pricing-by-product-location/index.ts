"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { pricingTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getPricingByProductLocationSchema } from "./schema";

export const getPricingByProductLocationAction = actionClient
  .schema(getPricingByProductLocationSchema)
  .action(async ({ parsedInput }) => {
    const pricing = await db
      .select()
      .from(pricingTable)
      .where(
        and(
          eq(pricingTable.productId, parsedInput.productId),
          eq(pricingTable.locationId, parsedInput.locationId)
        )
      )
      .limit(1);

    if (pricing.length === 0) {
      return { success: false, error: "Precificação não encontrada" };
    }

    return { success: true, data: pricing[0] };
  });
