import { z } from "zod";

export const deleteGroupSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
