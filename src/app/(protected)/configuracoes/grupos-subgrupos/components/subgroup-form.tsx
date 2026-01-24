"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSubgroupAction } from "@/actions/create-subgroup";
import { updateSubgroupAction } from "@/actions/update-subgroup";
import { getGroupsAction } from "@/actions/get-groups";

const subgroupFormSchema = z.object({
  cod: z.string().min(1, "O código é obrigatório"),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  groupId: z.string().min(1, "O grupo é obrigatório"),
});

type SubgroupFormValues = z.infer<typeof subgroupFormSchema>;

type Subgroup = {
  id: string;
  cod: string;
  nome: string;
  groupId: string;
};

type Group = {
  id: string;
  cod: string;
  nome: string;
};

type SubgroupFormProps = {
  subgroup?: Subgroup | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function SubgroupForm({ subgroup, open: controlledOpen, onOpenChange, trigger }: SubgroupFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const isEditMode = !!subgroup;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<SubgroupFormValues>({
    resolver: zodResolver(subgroupFormSchema),
    defaultValues: {
      cod: "",
      nome: "",
      groupId: "",
    },
  });

  const { execute: fetchGroups } = useAction(getGroupsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setGroups(data.data);
      }
    },
    onError: () => {
      toast.error("Erro ao carregar grupos");
    },
  });

  useEffect(() => {
    if (open) {
      fetchGroups({});
    }
  }, [open, fetchGroups]);

  useEffect(() => {
    if (subgroup && open) {
      form.reset({
        cod: subgroup.cod,
        nome: subgroup.nome,
        groupId: subgroup.groupId,
      });
    } else if (!subgroup && open) {
      form.reset({
        cod: "",
        nome: "",
        groupId: "",
      });
    }
  }, [subgroup, open, form]);

  const { execute: createSubgroup } = useAction(createSubgroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Subgrupo cadastrado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("subgroup-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar subgrupo");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const { execute: updateSubgroup } = useAction(updateSubgroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Subgrupo atualizado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("subgroup-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar subgrupo");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: SubgroupFormValues) => {
    if (isEditMode && subgroup) {
      updateSubgroup({ id: subgroup.id, ...data });
    } else {
      createSubgroup(data);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{isEditMode ? "Editar Subgrupo" : "Novo Subgrupo"}</DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados do subgrupo"
            : "Preencha os dados para cadastrar um novo subgrupo"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: SGR001"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Subgrupo de Vendas Online"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Atualizando..."
                  : "Cadastrando..."
                : isEditMode
                  ? "Atualizar"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  if (controlledOpen !== undefined) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Novo Subgrupo</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
