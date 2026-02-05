import { z } from "zod";

export const updatePricingSchema = z.object({
  id: z.string().min(1, "O ID é obrigatório"),
  preco: z.string().min(1, "O preço é obrigatório"),
  undMedidaVenda: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade de medida",
  }),
});
