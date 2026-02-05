import { z } from "zod";

export const deleteOrcamentoSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});
