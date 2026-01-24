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
import { createGroupAction } from "@/actions/create-group";
import { updateGroupAction } from "@/actions/update-group";

const groupFormSchema = z.object({
  cod: z.string().min(1, "O código é obrigatório"),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

type Group = {
  id: string;
  cod: string;
  nome: string;
};

type GroupFormProps = {
  group?: Group | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export function GroupForm({ group, open: controlledOpen, onOpenChange, trigger }: GroupFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!group;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      cod: "",
      nome: "",
    },
  });

  useEffect(() => {
    if (group && open) {
      form.reset({
        cod: group.cod,
        nome: group.nome,
      });
    } else if (!group && open) {
      form.reset({
        cod: "",
        nome: "",
      });
    }
  }, [group, open, form]);

  const { execute: createGroup } = useAction(createGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Grupo cadastrado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("group-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar grupo");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const { execute: updateGroup } = useAction(updateGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Grupo atualizado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("group-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar grupo");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: GroupFormValues) => {
    if (isEditMode && group) {
      updateGroup({ id: group.id, ...data });
    } else {
      createGroup(data);
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
        <DialogTitle>{isEditMode ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados do grupo"
            : "Preencha os dados para cadastrar um novo grupo"}
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
                    placeholder="Ex: GRP001"
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
                    placeholder="Ex: Grupo de Vendas"
                    {...field}
                  />
                </FormControl>
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
        <Button>Novo Grupo</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
