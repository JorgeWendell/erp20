import { z } from "zod";

export const deletePricingSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
});
