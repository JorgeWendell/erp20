import { z } from "zod";

export const updateClientSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  isActive: z.boolean(),
});
