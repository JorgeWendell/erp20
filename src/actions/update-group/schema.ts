import { z } from "zod";

export const updateGroupSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  cod: z.string().min(1, "O código é obrigatório"),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
});
