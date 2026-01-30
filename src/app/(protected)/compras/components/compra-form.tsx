"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createCompraAction } from "@/actions/create-compra";
import { updateCompraAction } from "@/actions/update-compra";
import { uploadNotaCompraAction } from "@/actions/upload-nota-compra";
import { getProductsAction } from "@/actions/get-products";
import { getGroupsAction } from "@/actions/get-groups";
import { getSubgroupsByGroupAction } from "@/actions/get-subgroups-by-group";
import { getSuppliersAction } from "@/actions/get-suppliers";
import { getLocationsAction } from "@/actions/get-locations";

const UND_MEDIDA_OPTIONS = [
  { value: "mts" as const, label: "mts" },
  { value: "br" as const, label: "br" },
  { value: "un" as const, label: "un" },
] as const;

const compraFormSchema = z.object({
  productId: z.string().min(1, "Selecione o produto"),
  supplierId: z.string().min(1, "Selecione o fornecedor"),
  locationId: z.string().min(1, "Selecione o local de entrega"),
  quantity: z.string().min(1, "Informe a quantidade"),
  undMedida: z.enum(["mts", "br", "un"], {
    required_error: "Selecione a unidade",
  }),
  temNota: z.boolean(),
});

type CompraFormValues = z.infer<typeof compraFormSchema>;

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
type Supplier = { id: string; nome: string };
type Location = { id: string; nome: string };

export type CompraRow = {
  id: string;
  codigo: string;
  productId: string;
  productCod: string;
  productNome: string;
  grupoCod: string;
  subgrupoCod: string;
  supplierId: string;
  supplierNome: string;
  locationId: string;
  locationNome: string;
  quantity: string;
  undMedida: string;
  temNota: boolean;
  notaFileUrl: string | null;
  status: string;
};

type CompraFormProps = {
  compra?: CompraRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CompraForm({
  compra,
  open: controlledOpen,
  onOpenChange,
}: CompraFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCod, setSearchCod] = useState("");
  const [searchGrupoId, setSearchGrupoId] = useState("");
  const [searchSubgrupoId, setSearchSubgrupoId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!compra;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<CompraFormValues>({
    resolver: zodResolver(compraFormSchema),
    defaultValues: {
      productId: "",
      supplierId: "",
      locationId: "",
      quantity: "",
      undMedida: "un",
      temNota: false,
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

  const { execute: fetchSuppliers } = useAction(getSuppliersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setSuppliers(data.data);
    },
  });

  const { execute: fetchLocations } = useAction(getLocationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setLocations(data.data);
    },
  });

  const { execute: createCompra } = useAction(createCompraAction, {
    onSuccess: async ({ data }) => {
      if (data?.success && data.id) {
        if (form.getValues("temNota") && selectedFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];
            if (base64) {
              await uploadNotaCompra({
                compraId: data.id,
                fileBase64: base64,
                fileName: selectedFile.name,
              });
            }
          };
          reader.readAsDataURL(selectedFile);
        }
        toast.success("Compra cadastrada com sucesso!");
        form.reset();
        setOpen(false);
        setSelectedFile(null);
        setProducts([]);
        window.dispatchEvent(new Event("compra-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar compra");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: uploadNotaCompra } = useAction(uploadNotaCompraAction, {
    onSuccess: ({ data }) => {
      if (data?.success) toast.success("Nota enviada com sucesso!");
    },
    onError: () => toast.error("Erro ao enviar nota"),
  });

  const { execute: updateCompra } = useAction(updateCompraAction, {
    onSuccess: async ({ data }) => {
      if (data?.success && compra) {
        if (form.getValues("temNota") && selectedFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];
            if (base64) {
              await uploadNotaCompra({
                compraId: compra.id,
                fileBase64: base64,
                fileName: selectedFile.name,
              });
            }
          };
          reader.readAsDataURL(selectedFile);
        }
        toast.success("Compra atualizada com sucesso!");
        form.reset();
        setOpen(false);
        setSelectedFile(null);
        window.dispatchEvent(new Event("compra-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar compra");
    },
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  useEffect(() => {
    if (open) {
      fetchGroups({});
      fetchSuppliers({});
      fetchLocations({});
    }
  }, [open, fetchGroups, fetchSuppliers, fetchLocations]);

  useEffect(() => {
    if (searchGrupoIdWatch) {
      fetchSubgroups({ groupId: searchGrupoIdWatch });
    } else {
      setSubgroups([]);
      setSearchSubgrupoId("");
    }
  }, [searchGrupoIdWatch, fetchSubgroups]);

  useEffect(() => {
    if (compra && open) {
      form.reset({
        productId: compra.productId,
        supplierId: compra.supplierId,
        locationId: compra.locationId,
        quantity: compra.quantity,
        undMedida: compra.undMedida as "mts" | "br" | "un",
        temNota: compra.temNota,
      });
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
    } else if (!compra && open) {
      form.reset({
        productId: "",
        supplierId: "",
        locationId: "",
        quantity: "",
        undMedida: "un",
        temNota: false,
      });
      setProducts([]);
      setSearchCod("");
      setSearchGrupoId("");
      setSearchSubgrupoId("");
      setSelectedFile(null);
    }
  }, [compra, open, form]);

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

  const onSubmit = (data: CompraFormValues) => {
    if (isEditMode && compra) {
      updateCompra({
        id: compra.id,
        supplierId: data.supplierId,
        locationId: data.locationId,
        quantity: data.quantity,
        undMedida: data.undMedida,
        temNota: data.temNota,
        notaFileUrl: data.temNota
          ? (selectedFile ? undefined : compra.notaFileUrl ?? null)
          : null,
      });
    } else {
      createCompra({
        productId: data.productId,
        supplierId: data.supplierId,
        locationId: data.locationId,
        quantity: data.quantity,
        undMedida: data.undMedida,
        temNota: data.temNota,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setProducts([]);
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar compra" : "Nova compra"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Altere os dados da compra (código, produto, grupo e subgrupo não podem ser alterados)"
              : "Busque o produto e preencha os dados da compra"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEditMode}
                      >
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

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
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
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de entrega *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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

            <FormField
              control={form.control}
              name="temNota"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Possui nota fiscal</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("temNota") && (
              <div className="space-y-2">
                <FormLabel>Upload da nota</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? selectedFile.name : "Selecionar arquivo (PDF ou imagem)"}
                </Button>
              </div>
            )}

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
    </Dialog>
  );
}
