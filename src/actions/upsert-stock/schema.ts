import { z } from "zod";

export const upsertStockSchema = z.object({
  productId: z.string().min(1, "ID do produto é obrigatório"),
  locationId: z.string().min(1, "Local é obrigatório"),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
});
