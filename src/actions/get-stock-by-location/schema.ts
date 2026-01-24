import { z } from "zod";

export const getStockByLocationSchema = z.object({
  locationId: z.string().min(1, "ID do local é obrigatório"),
});
