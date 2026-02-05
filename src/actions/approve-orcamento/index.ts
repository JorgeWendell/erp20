"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { orcamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { approveOrcamentoSchema } from "./schema";

export const approveOrcamentoAction = actionClient
  .schema(approveOrcamentoSchema)
  .action(async ({ parsedInput }) => {
    const existing = await db
      .select()
      .from(orcamentosTable)
      .where(eq(orcamentosTable.id, parsedInput.id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    const orcamento = existing[0];
    if (orcamento.status !== "pendente") {
      return {
        success: false,
        error: "Apenas orçamentos pendentes podem ser aprovados",
      };
    }

    await db
      .update(orcamentosTable)
      .set({
        status: "aprovado",
        updatedAt: new Date(),
      })
      .where(eq(orcamentosTable.id, parsedInput.id));

    return { success: true };
  });
