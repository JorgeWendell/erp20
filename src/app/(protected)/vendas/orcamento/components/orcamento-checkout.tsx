"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { createOrcamentoAction } from "@/actions/create-orcamento";
import { getClientsAction } from "@/actions/get-clients";
import type { CartItem } from "./orcamento-content";

const checkoutFormSchema = z.object({
  clientId: z.string().min(1, "O cliente é obrigatório"),
  observacoes: z.string().optional(),
  validade: z.string().min(1, "A data de validade é obrigatória"),
  temNota: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type Client = {
  id: string;
  nome: string;
  isActive: boolean;
};

type OrcamentoCheckoutProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  locationId: string;
  total: number;
  onSuccess: () => void;
};

export function OrcamentoCheckout({
  open,
  onOpenChange,
  cart,
  locationId,
  total,
  onSuccess,
}: OrcamentoCheckoutProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      clientId: "",
      observacoes: "",
      validade: "",
      temNota: false,
    },
  });

  const { execute: fetchClients } = useAction(getClientsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setClients(data.data.filter((c) => c.isActive));
      }
    },
  });

  const { execute: createOrcamento } = useAction(createOrcamentoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(`Orçamento criado com sucesso! Código: ${data.codigo}`);
        form.reset();
        onOpenChange(false);
        window.dispatchEvent(new Event("orcamento-created"));
        onSuccess();
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao criar orçamento");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar orçamento");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  useEffect(() => {
    if (open) {
      fetchClients({});
      const hoje = new Date();
      const proximoMes = new Date(hoje);
      proximoMes.setMonth(proximoMes.getMonth() + 1);
      const validadePadrao = proximoMes.toISOString().split("T")[0];
      form.reset({
        clientId: "",
        observacoes: "",
        validade: validadePadrao,
        temNota: false,
      });
    }
  }, [open, fetchClients, form]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const onSubmit = (data: CheckoutFormValues) => {
    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho");
      return;
    }

    createOrcamento({
      locationId,
      clientId: data.clientId,
      observacoes: data.observacoes || undefined,
      validade: data.validade,
      temNota: data.temNota,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity.toString(),
        undMedida: item.undMedida as "mts" | "br" | "un",
        precoUnitario: item.precoUnitario.toString(),
        subtotal: item.subtotal.toString(),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Orçamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar o orçamento
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Itens do orçamento ({cart.length})
              </p>
              <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.produto}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.undMedida} ×{" "}
                        {formatPrice(item.precoUnitario)}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total:
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Validade *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o orçamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temNota"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Nota</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || cart.length === 0}>
                {isSubmitting ? "Criando..." : "Criar Orçamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
