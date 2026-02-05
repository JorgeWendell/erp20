import { z } from "zod";

export const getPricingSchema = z.object({
  locationId: z.string().optional(),
  productId: z.string().optional(),
});
