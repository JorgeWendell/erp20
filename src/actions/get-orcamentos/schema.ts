import { z } from "zod";

export const getOrcamentosSchema = z.object({
  status: z.enum(["pendente", "aprovado", "recusado", "convertido", "vencido"]).optional(),
  clientId: z.string().optional(),
  locationId: z.string().optional(),
});
