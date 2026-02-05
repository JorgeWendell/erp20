import { z } from "zod";

export const vendaItemSchema = z.object({
  productId: z.string(),
  quantity: z.string(),
  undMedida: z.enum(["mts", "br", "un"]),
  precoUnitario: z.string(),
  subtotal: z.string(),
});

export const createVendaSchema = z.object({
  locationId: z.string().min(1, "O local é obrigatório"),
  clientId: z.string().optional(),
  observacoes: z.string().optional(),
  temNota: z.boolean().default(false),
  items: z.array(vendaItemSchema).min(1, "Adicione pelo menos um item"),
});
