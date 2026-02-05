"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { pricingTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deletePricingSchema } from "./schema";

export const deletePricingAction = actionClient
  .schema(deletePricingSchema)
  .action(async ({ parsedInput }) => {
    await db.delete(pricingTable).where(eq(pricingTable.id, parsedInput.id));

    return { success: true };
  });
