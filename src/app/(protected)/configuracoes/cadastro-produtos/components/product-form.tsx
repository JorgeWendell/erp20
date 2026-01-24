"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
import { createProductAction } from "@/actions/create-product";
import { updateProductAction } from "@/actions/update-product";
import { getGroupsAction } from "@/actions/get-groups";
import { getSubgroupsByGroupAction } from "@/actions/get-subgroups-by-group";
import { ProductFormLocationsTab } from "./product-form-locations-tab";

const UND_MEDIDA_OPTIONS = [
  { value: "mts" as const, label: "mts" },
  { value: "br" as const, label: "br" },
  { value: "un" as const, label: "un" },
] as const;

const productFormSchema = z.object({
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

type ProductFormValues = z.infer<typeof productFormSchema>;

type Group = {
  id: string;
  cod: string;
  nome: string;
};

type Subgroup = {
  id: string;
  cod: string;
  nome: string;
  groupId: string;
};

type Product = {
  id: string;
  cod: string;
  grupoId: string;
  subgrupoId: string;
  nome: string;
  undMedida: string;
  referencia1: string | null;
  referencia2: string | null;
  grupoNome?: string | null;
  subgrupoNome?: string | null;
};

type ProductFormProps = {
  product?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

type TabId = "dados" | "locais";

export function ProductForm({ product, open: controlledOpen, onOpenChange, trigger }: ProductFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("dados");
  const isEditMode = !!product;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      cod: "",
      grupoId: "",
      subgrupoId: "",
      nome: "",
      undMedida: "un",
      referencia1: "",
      referencia2: "",
    },
  });

  const selectedGroupId = form.watch("grupoId");

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

  const { execute: fetchSubgroups } = useAction(getSubgroupsByGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setSubgroups(data.data);
        // Reset subgrupo se não estiver na lista
        const currentSubgrupoId = form.getValues("subgrupoId");
        if (currentSubgrupoId && !data.data.find((sg) => sg.id === currentSubgrupoId)) {
          form.setValue("subgrupoId", "");
        }
      }
    },
    onError: () => {
      toast.error("Erro ao carregar subgrupos");
    },
  });

  useEffect(() => {
    if (open) {
      fetchGroups({});
    }
  }, [open, fetchGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchSubgroups({ groupId: selectedGroupId });
    } else {
      setSubgroups([]);
      form.setValue("subgrupoId", "");
    }
  }, [selectedGroupId, fetchSubgroups, form]);

  useEffect(() => {
    if (product && open) {
      form.reset({
        cod: product.cod,
        grupoId: product.grupoId,
        subgrupoId: product.subgrupoId,
        nome: product.nome,
        undMedida: (product.undMedida as "mts" | "br" | "un") || "un",
        referencia1: product.referencia1 || "",
        referencia2: product.referencia2 || "",
      });
      if (product.grupoId) {
        fetchSubgroups({ groupId: product.grupoId });
      }
    } else if (!product && open) {
      form.reset({
        cod: "",
        grupoId: "",
        subgrupoId: "",
        nome: "",
        undMedida: "un",
        referencia1: "",
        referencia2: "",
      });
      setSubgroups([]);
    }
  }, [product, open, form, fetchSubgroups]);

  const { execute: createProduct } = useAction(createProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Produto cadastrado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("product-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar produto");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const { execute: updateProduct } = useAction(updateProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Produto atualizado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("product-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar produto");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEditMode && product) {
      updateProduct({ id: product.id, ...data });
    } else {
      createProduct(data);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setSubgroups([]);
      setActiveTab("dados");
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditMode ? "Editar Produto" : "Cadastrar Produto"}</DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados do produto"
            : "Preencha os dados para cadastrar um novo produto"}
        </DialogDescription>
      </DialogHeader>
      {isEditMode && (
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 -mx-6 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("dados")}
            className={cn(
              "py-2.5 px-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "dados"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Dados do produto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("locais")}
            className={cn(
              "py-2.5 px-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "locais"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Localização e quantidade
          </button>
        </div>
      )}
      {activeTab === "locais" && isEditMode && product ? (
        <ProductFormLocationsTab productId={product.id} undMedida={product.undMedida} />
      ) : (
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
                    placeholder="Ex: PROD001"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="grupoId"
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
            <FormField
              control={form.control}
              name="subgrupoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subgrupo *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedGroupId || subgroups.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedGroupId 
                            ? "Selecione um grupo primeiro" 
                            : subgroups.length === 0
                            ? "Nenhum subgrupo disponível"
                            : "Selecione um subgrupo"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subgroups.map((subgroup) => (
                        <SelectItem key={subgroup.id} value={subgroup.id}>
                          {subgroup.nome}
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
              name="undMedida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de medida *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Produto Exemplo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="referencia1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referência 1</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: REF001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referencia2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referência 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: REF002"
                      {...field}
                    />
                  </FormControl>
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
      )}
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
        <Button>Cadastrar Produto</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
