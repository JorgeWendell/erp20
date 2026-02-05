import { z } from "zod";

export const getProductsForPricingSchema = z.object({
  locationId: z.string().min(1, "O local é obrigatório"),
});
