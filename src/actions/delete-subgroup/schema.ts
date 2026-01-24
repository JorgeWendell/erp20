import { z } from "zod";

export const deleteSubgroupSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
