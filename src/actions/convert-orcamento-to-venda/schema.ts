import { z } from "zod";

export const convertOrcamentoToVendaSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});
