"use client";

import { useState, useEffect } from "react";
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
import { createSupplierAction } from "@/actions/create-supplier";
import { updateSupplierAction } from "@/actions/update-supplier";

const supplierFormSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

type Supplier = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpfCnpj: string | null;
  endereco: string | null;
  numero: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  isActive: boolean;
};

type SupplierFormProps = {
  supplier?: Supplier | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

const maskPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
};

const maskCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4").replace(/[-.]$/, "");
  }
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5").replace(/[-./]$/, "");
};

const maskCep = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{5})(\d{0,3})/, "$1-$2").replace(/-$/, "");
};

const fetchCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return {
      endereco: data.logradouro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};

export function SupplierForm({ supplier, open: controlledOpen, onOpenChange, trigger }: SupplierFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const isEditMode = !!supplier;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpfCnpj: "",
      endereco: "",
      numero: "",
      cidade: "",
      estado: "",
      cep: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (supplier && open) {
      form.reset({
        nome: supplier.nome,
        email: supplier.email || "",
        telefone: supplier.telefone || "",
        cpfCnpj: supplier.cpfCnpj || "",
        endereco: supplier.endereco || "",
        numero: supplier.numero || "",
        cidade: supplier.cidade || "",
        estado: supplier.estado || "",
        cep: supplier.cep || "",
        isActive: supplier.isActive,
      });
    } else if (!supplier && open) {
      form.reset({
        nome: "",
        email: "",
        telefone: "",
        cpfCnpj: "",
        endereco: "",
        numero: "",
        cidade: "",
        estado: "",
        cep: "",
        isActive: true,
      });
    }
  }, [supplier, open, form]);

  const { execute: createSupplier } = useAction(createSupplierAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Fornecedor cadastrado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("supplier-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cadastrar fornecedor");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const { execute: updateSupplier } = useAction(updateSupplierAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Fornecedor atualizado com sucesso!");
        form.reset();
        setOpen(false);
        window.dispatchEvent(new Event("supplier-created"));
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar fornecedor");
    },
    onExecute: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: SupplierFormValues) => {
    if (isEditMode && supplier) {
      updateSupplier({ id: supplier.id, ...data });
    } else {
      createSupplier(data);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditMode ? "Editar Fornecedor" : "Cadastrar Fornecedor"}</DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Altere os dados do fornecedor"
            : "Preencha os dados para cadastrar um novo fornecedor"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: João Silva"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ex: joao@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: (11) 99999-9999"
                      value={field.value || ""}
                      onChange={(e) => {
                        const masked = maskPhone(e.target.value);
                        field.onChange(masked);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="cpfCnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-90"
                    value={field.value || ""}
                    onChange={(e) => {
                      const masked = maskCpfCnpj(e.target.value);
                      field.onChange(masked);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Rua das Flores"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: São Paulo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: SP"
                      maxLength={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP {isLoadingCep && "(Buscando...)"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 12345-678"
                      value={field.value || ""}
                      onChange={(e) => {
                        const masked = maskCep(e.target.value);
                        field.onChange(masked);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const cepValue = field.value?.replace(/\D/g, "") || "";
                          if (cepValue.length === 8) {
                            setIsLoadingCep(true);
                            const cepData = await fetchCep(cepValue);
                            if (cepData) {
                              form.setValue("endereco", cepData.endereco);
                              form.setValue("cidade", cepData.cidade);
                              form.setValue("estado", cepData.estado);
                              toast.success("CEP encontrado!");
                            } else {
                              toast.error("CEP não encontrado");
                            }
                            setIsLoadingCep(false);
                          } else {
                            toast.error("CEP inválido");
                          }
                        }
                      }}
                      disabled={isLoadingCep}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Fornecedor Ativo</FormLabel>
                </div>
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
        <Button>Cadastrar Fornecedor</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
