"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createPricingAction } from "@/actions/create-pricing";
import { updatePricingAction } from "@/actions/update-pricing";
import { getProductsForPricingAction } from "@/actions/get-products-for-pricing";

const UND_MEDIDA_OPTIONS = [
  { value: "mts" as const, label: "mts" },
  { value: "br" as const, label: "br" },
  { value: "un" as const, label: "un" },
] as const;

const pricingFormSchema = z.object({
  productId: z.string().min(1, "Selecione o produto"),
  preco: z.string().min(1, "Informe o preço"),
  undMedidaVenda: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade de medida",
  }),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

type Product = {
  id: string;
  productId: string;
  cod: string;
  produto: string;
  undMedida: string;
  quantity: string;
};

export type PricingRow = {
  id: string;
  productId: string;
  locationId: string;
  productCod: string;
  productNome: string;
  locationNome: string;
  grupoCod: string | null;
  subgrupoCod: string | null;
  preco: string;
  undMedidaVenda: string;
};

type PricingFormProps = {
  pricing?: PricingRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  locationId: string | null;
};

export function PricingForm({
  pricing,
  open: controlledOpen,
  onOpenChange,
  locationId,
}: PricingFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const isEditMode = !!pricing;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      productId: "",
      preco: "",
      undMedidaVenda: "un",
    },
  });

  const { execute: fetchProducts } = useAction(getProductsForPricingAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setProducts(data.data);
      }
      setIsLoadingProducts(false);
    },
    onError: () => {
      toast.error("Erro ao buscar produtos");
      setIsLoadingProducts(false);
    },
  });

  const { execute: createPricing } = useAction(createPricingAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Precificação cadastrada com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("pricing-created"));
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao cadastrar precificação");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar precificação");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: updatePricing } = useAction(updatePricingAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Precificação atualizada com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("pricing-created"));
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao atualizar precificação");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar precificação");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  useEffect(() => {
    if (open && locationId && !isEditMode) {
      setIsLoadingProducts(true);
      fetchProducts({ locationId });
    }
  }, [open, locationId, isEditMode, fetchProducts]);

  useEffect(() => {
    if (pricing && open) {
      form.reset({
        productId: pricing.productId,
        preco: pricing.preco,
        undMedidaVenda: pricing.undMedidaVenda as "mts" | "br" | "un",
      });
      setProducts([
        {
          id: pricing.id,
          productId: pricing.productId,
          cod: pricing.productCod,
          produto: pricing.productNome,
          undMedida: pricing.undMedidaVenda,
          quantity: "0",
        },
      ]);
    } else if (!pricing && open) {
      form.reset({
        productId: "",
        preco: "",
        undMedidaVenda: "un",
      });
      if (locationId) {
        setIsLoadingProducts(true);
        fetchProducts({ locationId });
      }
    }
  }, [pricing, open, form, locationId, fetchProducts]);

  const onSubmit = (data: PricingFormValues) => {
    if (!locationId) {
      toast.error("Selecione um local primeiro");
      return;
    }

    const precoValue = data.preco.replace(",", ".");

    if (isEditMode && pricing) {
      updatePricing({
        id: pricing.id,
        preco: precoValue,
        undMedidaVenda: data.undMedidaVenda,
      });
    } else {
      createPricing({
        productId: data.productId,
        locationId,
        preco: precoValue,
        undMedidaVenda: data.undMedidaVenda,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setProducts([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar precificação" : "Nova precificação"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Altere o preço e unidade de medida para venda"
              : "Selecione o produto e defina o preço e unidade de medida para venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEditMode && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingProducts || products.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingProducts
                                ? "Carregando produtos..."
                                : products.length === 0
                                  ? "Nenhum produto em estoque"
                                  : "Selecione o produto"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.productId} value={p.productId}>
                            {p.cod} — {p.produto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => {
                  const numericValue = field.value ? parseFloat(field.value.replace(",", ".")) : undefined;
                  return (
                    <FormItem>
                      <FormLabel>Preço *</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="R$ "
                          decimalScale={2}
                          fixedDecimalScale
                          placeholder="R$ 0,00"
                          value={numericValue}
                          onValueChange={(values) => {
                            field.onChange(values.value);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="undMedidaVenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Venda *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UND_MEDIDA_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !locationId}>
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
    </Dialog>
  );
}
