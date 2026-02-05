import { z } from "zod";

export const orcamentoItemSchema = z.object({
  productId: z.string(),
  quantity: z.string(),
  undMedida: z.enum(["mts", "br", "un"]),
  precoUnitario: z.string(),
  subtotal: z.string(),
});

export const createOrcamentoSchema = z.object({
  locationId: z.string().min(1, "O local é obrigatório"),
  clientId: z.string().min(1, "O cliente é obrigatório"),
  observacoes: z.string().optional(),
  validade: z.string().min(1, "A data de validade é obrigatória"),
  temNota: z.boolean().default(false),
  items: z.array(orcamentoItemSchema).min(1, "Adicione pelo menos um item"),
});
