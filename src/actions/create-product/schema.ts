import { z } from "zod";

export const createProductSchema = z.object({
  cod: z.string().min(1, "O código é obrigatório"),
  grupoId: z.string().min(1, "O grupo é obrigatório"),
  subgrupoId: z.string().min(1, "O subgrupo é obrigatório"),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  undMedida: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade de medida",
  }),
  referencia1: z.string().optional(),
  referencia2: z.string().optional(),
});
