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
import { updateOrcamentoAction } from "@/actions/update-orcamento";
import { getOrcamentoAction } from "@/actions/get-orcamento";
import { getClientsAction } from "@/actions/get-clients";
import { NumericFormat } from "react-number-format";
import type { CartItem } from "./orcamento-content";

const orcamentoFormSchema = z.object({
  clientId: z.string().min(1, "O cliente é obrigatório"),
  observacoes: z.string().optional(),
  validade: z.string().min(1, "A data de validade é obrigatória"),
  temNota: z.boolean().default(false),
  items: z.array(
    z.object({
      productId: z.string(),
      cod: z.string(),
      produto: z.string(),
      quantity: z.number(),
      undMedida: z.string(),
      precoUnitario: z.number(),
      subtotal: z.number(),
    })
  ).min(1, "Adicione pelo menos um item"),
});

type OrcamentoFormValues = z.infer<typeof orcamentoFormSchema>;

type Client = {
  id: string;
  nome: string;
  isActive: boolean;
};

type OrcamentoFormProps = {
  orcamento: {
    id: string;
    codigo: string;
    clientId: string;
    clientNome: string;
    locationId: string;
    locationNome: string;
    total: string;
    observacoes: string | null;
    validade: Date;
    temNota: boolean;
    status: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrcamentoForm({
  orcamento,
  open,
  onOpenChange,
}: OrcamentoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrcamentoFormValues>({
    resolver: zodResolver(orcamentoFormSchema),
    defaultValues: {
      clientId: "",
      observacoes: "",
      validade: "",
      temNota: false,
      items: [],
    },
  });

  const { execute: fetchClients } = useAction(getClientsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setClients(data.data.filter((c) => c.isActive));
      }
    },
  });

  const { execute: fetchOrcamento } = useAction(getOrcamentoAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        const orc = data.data;
        const validadeDate = new Date(orc.validade);
        const validadeStr = validadeDate.toISOString().split("T")[0];

        const items: CartItem[] = orc.items.map((item) => ({
          id: `${item.productId}-${item.undMedida}`,
          productId: item.productId,
          cod: item.grupoCod && item.subgrupoCod
            ? `${item.grupoCod} - ${item.subgrupoCod} - ${item.productCod}`
            : item.productCod,
          produto: item.productNome,
          quantity: parseFloat(item.quantity),
          undMedida: item.undMedida,
          precoUnitario: parseFloat(item.precoUnitario),
          subtotal: parseFloat(item.subtotal),
          stockQuantity: parseFloat(item.quantity),
        }));

        form.reset({
          clientId: orc.clientId,
          observacoes: orc.observacoes || "",
          validade: validadeStr,
          temNota: orc.temNota,
          items,
        });
        setCart(items);
      } else {
        toast.error("Erro ao carregar orçamento");
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar orçamento");
      setIsLoading(false);
    },
  });

  const { execute: updateOrcamento } = useAction(updateOrcamentoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Orçamento atualizado com sucesso!");
        form.reset();
        setCart([]);
        onOpenChange(false);
        window.dispatchEvent(new Event("orcamento-created"));
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao atualizar orçamento");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar orçamento");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  useEffect(() => {
    if (open) {
      fetchClients({});
      if (orcamento) {
        setIsLoading(true);
        fetchOrcamento({ id: orcamento.id });
      } else {
        form.reset();
        setCart([]);
      }
    }
  }, [open, orcamento, fetchClients, fetchOrcamento, form]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const updateCartItem = (id: string, quantity: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (quantity <= 0) {
      setCart(cart.filter((i) => i.id !== id));
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.id === id
          ? {
              ...cartItem,
              quantity,
              subtotal: quantity * cartItem.precoUnitario,
            }
          : cartItem
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const onSubmit = (data: OrcamentoFormValues) => {
    if (!orcamento) return;
    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho");
      return;
    }

    updateOrcamento({
      id: orcamento.id,
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

  useEffect(() => {
    form.setValue("items", cart);
  }, [cart, form]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center text-muted-foreground">
            Carregando orçamento...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Orçamento</DialogTitle>
          <DialogDescription>
            Altere os dados do orçamento {orcamento?.codigo}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Itens do orçamento ({cart.length})
              </p>
              <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 max-h-[300px] overflow-y-auto space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nenhum item no carrinho
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.produto}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.cod}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator=""
                          decimalSeparator=","
                          decimalScale={4}
                          value={item.quantity}
                          onValueChange={(values) => {
                            const qty = parseFloat(values.value.replace(",", "."));
                            if (!Number.isNaN(qty) && qty > 0) {
                              updateCartItem(item.id, qty);
                            }
                          }}
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground">{item.undMedida}</span>
                        <span className="font-medium w-24 text-right">
                          {formatPrice(item.subtotal)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
                {isSubmitting ? "Atualizando..." : "Atualizar Orçamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
