import { z } from "zod";

export const entradaEstoqueSchema = z.object({
  productId: z.string().min(1, "Selecione o produto"),
  locationId: z.string().min(1, "Selecione o local de entrega"),
  quantity: z.string().min(1, "Informe a quantidade"),
  compraId: z.string().optional(),
});
