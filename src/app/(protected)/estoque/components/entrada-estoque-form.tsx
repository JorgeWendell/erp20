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
import { entradaEstoqueAction } from "@/actions/entrada-estoque";
import { getComprasAction } from "@/actions/get-compras";
import { getProductsAction } from "@/actions/get-products";
import { getGroupsAction } from "@/actions/get-groups";
import { getSubgroupsByGroupAction } from "@/actions/get-subgroups-by-group";
import { getLocationsAction } from "@/actions/get-locations";

const UND_MEDIDA_OPTIONS = [
  { value: "mts" as const, label: "mts" },
  { value: "br" as const, label: "br" },
  { value: "un" as const, label: "un" },
] as const;

const entradaEstoqueFormSchema = z.object({
  productId: z.string().min(1, "Selecione o produto"),
  locationId: z.string().min(1, "Selecione o local de entrega"),
  quantity: z.string().min(1, "Informe a quantidade"),
  undMedida: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade",
  }),
});

type EntradaEstoqueFormValues = z.infer<typeof entradaEstoqueFormSchema>;

type Product = {
  id: string;
  cod: string;
  nome: string;
  undMedida: string;
  grupoNome: string | null;
  subgrupoNome: string | null;
};

type Group = { id: string; cod: string; nome: string };
type Subgroup = { id: string; cod: string; nome: string; groupId: string };
type Location = { id: string; nome: string };

type CompraAprovada = {
  id: string;
  codigo: string;
  productId: string;
  productCod: string;
  productNome: string;
  grupoCod: string;
  subgrupoCod: string;
  locationId: string;
  locationNome: string;
  quantity: string;
  undMedida: string;
};

type EntradaEstoqueFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function EntradaEstoqueForm({
  open,
  onOpenChange,
  onSuccess,
}: EntradaEstoqueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCod, setSearchCod] = useState("");
  const [searchGrupoId, setSearchGrupoId] = useState("");
  const [searchSubgrupoId, setSearchSubgrupoId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [comprasAprovadas, setComprasAprovadas] = useState<CompraAprovada[]>([]);
  const [selectedCompra, setSelectedCompra] = useState<CompraAprovada | null>(null);
  const [isLoadingCompras, setIsLoadingCompras] = useState(false);

  const form = useForm<EntradaEstoqueFormValues>({
    resolver: zodResolver(entradaEstoqueFormSchema),
    defaultValues: {
      productId: "",
      locationId: "",
      quantity: "",
      undMedida: "un",
    },
  });

  const selectedProduct = products.find((p) => p.id === form.watch("productId"));
  const searchGrupoIdWatch = searchGrupoId;

  const { execute: fetchProducts } = useAction(getProductsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setProducts(data.data);
      }
      setIsSearchingProducts(false);
    },
    onError: () => {
      toast.error("Erro ao buscar produtos");
      setIsSearchingProducts(false);
    },
  });

  const { execute: fetchGroups } = useAction(getGroupsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setGroups(data.data);
    },
  });

  const { execute: fetchSubgroups } = useAction(getSubgroupsByGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setSubgroups(data.data);
    },
  });

  const { execute: fetchLocations } = useAction(getLocationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setLocations(data.data);
    },
  });

  const { execute: fetchComprasAprovadas } = useAction(getComprasAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setComprasAprovadas(data.data);
      }
      setIsLoadingCompras(false);
    },
    onError: () => {
      toast.error("Erro ao carregar pedidos");
      setIsLoadingCompras(false);
    },
  });

  const { execute: entradaEstoque } = useAction(entradaEstoqueAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Entrada validada com sucesso!");
        form.reset();
        onOpenChange(false);
        setProducts([]);
        setSearchCod("");
        setSearchGrupoId("");
        setSearchSubgrupoId("");
        setSelectedCompra(null);
        onSuccess?.();
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao registrar entrada");
      }
    },
    onError: () => {
      toast.error("Erro ao registrar entrada");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  useEffect(() => {
    if (open) {
      fetchGroups({});
      fetchLocations({});
      setIsLoadingCompras(true);
      fetchComprasAprovadas({ status: "aprovado" });
    }
  }, [open, fetchGroups, fetchLocations, fetchComprasAprovadas]);

  useEffect(() => {
    if (searchGrupoIdWatch) {
      fetchSubgroups({ groupId: searchGrupoIdWatch });
    } else {
      setSubgroups([]);
      setSearchSubgrupoId("");
    }
  }, [searchGrupoIdWatch, fetchSubgroups]);

  useEffect(() => {
    if (open && !selectedCompra && !products.length) {
      form.reset({
        productId: "",
        locationId: "",
        quantity: "",
        undMedida: "un",
      });
      setSearchCod("");
      setSearchGrupoId("");
      setSearchSubgrupoId("");
    }
  }, [open, form, products.length, selectedCompra]);

  useEffect(() => {
    if (selectedProduct) {
      form.setValue("undMedida", selectedProduct.undMedida as "mts" | "br" | "un");
    }
  }, [selectedProduct?.id, selectedProduct?.undMedida, form]);

  const handleBuscarProdutos = () => {
    setIsSearchingProducts(true);
    fetchProducts({
      cod: searchCod.trim() || undefined,
      grupoId: searchGrupoId || undefined,
      subgrupoId: searchSubgrupoId || undefined,
    });
  };

  const onSubmit = (data: EntradaEstoqueFormValues) => {
    entradaEstoque({
      productId: data.productId,
      locationId: data.locationId,
      quantity: data.quantity,
      compraId: selectedCompra?.id,
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset();
      setProducts([]);
      setSearchCod("");
      setSearchGrupoId("");
      setSearchSubgrupoId("");
      setSelectedCompra(null);
    }
  };

  const handleSelectPedido = (compraId: string) => {
    const compra = comprasAprovadas.find((c) => c.id === compraId);
    if (compra) {
      setSelectedCompra(compra);
      form.setValue("productId", compra.productId);
      form.setValue("locationId", compra.locationId);
      form.setValue("quantity", compra.quantity);
      form.setValue("undMedida", compra.undMedida as "mts" | "br" | "un");
      setProducts([
        {
          id: compra.productId,
          cod: compra.productCod,
          nome: compra.productNome,
          undMedida: compra.undMedida,
          grupoNome: compra.grupoCod,
          subgrupoNome: compra.subgrupoCod,
        },
      ]);
    } else {
      setSelectedCompra(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova entrada</DialogTitle>
          <DialogDescription>
            Selecione um pedido aprovado para validar a entrada ou busque o produto manualmente
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Pedido de compra
              </p>
              <Select
                value={selectedCompra?.id ?? "__nenhum__"}
                onValueChange={(value) => {
                  if (value && value !== "__nenhum__") {
                    handleSelectPedido(value);
                  } else {
                    setSelectedCompra(null);
                    form.reset({ productId: "", locationId: "", quantity: "", undMedida: "un" });
                    setProducts([]);
                  }
                }}
                disabled={isLoadingCompras}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCompras ? "Carregando..." : "Selecione o código do pedido"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__nenhum__">
                    Nenhum (buscar produto manualmente)
                  </SelectItem>
                  {comprasAprovadas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompra && (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-slate-50 dark:bg-slate-800/30">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Código completo
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {selectedCompra.grupoCod} — {selectedCompra.subgrupoCod} — {selectedCompra.productCod}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Produto
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedCompra.productNome}
                </p>
              </div>
            )}

            {!selectedCompra && (
            <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Buscar produto
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Código"
                  value={searchCod}
                  onChange={(e) => setSearchCod(e.target.value)}
                />
                <Select
                  value={searchGrupoId}
                  onValueChange={(v) => {
                    setSearchGrupoId(v);
                    setSearchSubgrupoId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={searchSubgrupoId}
                  onValueChange={setSearchSubgrupoId}
                  disabled={!searchGrupoId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Subgrupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {subgroups.map((sg) => (
                      <SelectItem key={sg.id} value={sg.id}>
                        {sg.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBuscarProdutos}
                disabled={isSearchingProducts}
              >
                {isSearchingProducts ? "Buscando..." : "Buscar"}
              </Button>
              {products.length > 0 && (
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.cod} — {p.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            )}

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de entrega *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o local" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="undMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Validando..." : "Validar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
