import { z } from "zod";

export const createGroupSchema = z.object({
  cod: z.string().min(1, "O código é obrigatório"),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
});
