"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { orcamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteOrcamentoSchema } from "./schema";

export const deleteOrcamentoAction = actionClient
  .schema(deleteOrcamentoSchema)
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
    if (orcamento.status !== "pendente" && orcamento.status !== "recusado") {
      return {
        success: false,
        error: "Apenas orçamentos pendentes ou recusados podem ser excluídos",
      };
    }

    await db.delete(orcamentosTable).where(eq(orcamentosTable.id, parsedInput.id));

    return { success: true };
  });
