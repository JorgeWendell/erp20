import { z } from "zod";

export const getOrcamentoPdfDataSchema = z.object({
  orcamentoId: z.string().min(1, "O ID do orçamento é obrigatório"),
});
