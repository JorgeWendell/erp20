import { z } from "zod";

export const sendOrcamentoEmailSchema = z.object({
  orcamentoId: z.string().min(1, "O ID do orçamento é obrigatório"),
  email: z.string().email("Email inválido"),
});
