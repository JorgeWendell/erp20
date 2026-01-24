import { z } from "zod";

export const getSubgroupsByGroupSchema = z.object({
  groupId: z.string().min(1, "ID do grupo é obrigatório"),
});
