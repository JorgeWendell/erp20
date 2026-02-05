import { z } from "zod";

export const getStockForPdvSchema = z.object({
  locationId: z.string().min(1, "O local é obrigatório"),
});
