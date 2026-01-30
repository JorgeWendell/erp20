import { z } from "zod";

export const getComprasSchema = z.object({
  status: z.enum(["pendente", "aprovado", "reprovado", "entregue"]).optional(),
});
