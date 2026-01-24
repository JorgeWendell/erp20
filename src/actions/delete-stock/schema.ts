import { z } from "zod";

export const deleteStockSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
