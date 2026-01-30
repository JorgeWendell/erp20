import { z } from "zod";

export const uploadNotaCompraSchema = z.object({
  compraId: z.string().min(1, "ID da compra é obrigatório"),
  fileBase64: z.string().min(1, "Arquivo é obrigatório"),
  fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
});
