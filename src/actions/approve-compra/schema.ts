import { z } from "zod";

export const approveCompraSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
