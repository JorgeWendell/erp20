import { z } from "zod";

export const getStockByProductSchema = z.object({
  productId: z.string().min(1, "ID do produto é obrigatório"),
});
