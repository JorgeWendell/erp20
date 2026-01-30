import { z } from "zod";

export const updateCompraSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  supplierId: z.string().min(1, "Selecione o fornecedor"),
  locationId: z.string().min(1, "Selecione o local de entrega"),
  quantity: z.string().min(1, "Informe a quantidade"),
  undMedida: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade",
  }),
  temNota: z.boolean(),
  notaFileUrl: z.string().optional().nullable(),
});
