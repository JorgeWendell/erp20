import { z } from "zod";

export const getProductsSchema = z.object({
  cod: z.string().optional(),
  grupoId: z.string().optional(),
  subgrupoId: z.string().optional(),
});
