import { z } from "zod";

export const createPricingSchema = z.object({
  productId: z.string().min(1, "O produto é obrigatório"),
  locationId: z.string().min(1, "O local é obrigatório"),
  preco: z.string().min(1, "O preço é obrigatório"),
  undMedidaVenda: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade de medida",
  }),
});
