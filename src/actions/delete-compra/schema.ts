import { z } from "zod";

export const deleteCompraSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
