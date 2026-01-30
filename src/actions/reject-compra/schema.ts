import { z } from "zod";

export const rejectCompraSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
