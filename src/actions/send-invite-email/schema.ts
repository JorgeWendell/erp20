import { z } from "zod";

export const sendInviteEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  token: z.string().min(1, "Token é obrigatório"),
});
