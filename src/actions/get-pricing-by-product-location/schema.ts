import { z } from "zod";

export const getPricingByProductLocationSchema = z.object({
  productId: z.string().min(1, "O produto é obrigatório"),
  locationId: z.string().min(1, "O local é obrigatório"),
});
