"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TablePagination, TABLE_PAGE_SIZE } from "@/components/ui/table-pagination";
import { getSuppliersAction } from "@/actions/get-suppliers";
import { deleteSupplierAction } from "@/actions/delete-supplier";
import { SupplierForm } from "./supplier-form";

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
  createdAt: Date;
  updatedAt: Date;
};

export function SuppliersTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const paginated = suppliers.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const { execute: fetchSuppliers } = useAction(getSuppliersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setSuppliers(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar fornecedores");
      setIsLoading(false);
    },
  });

  const { execute: deleteSupplier } = useAction(deleteSupplierAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Fornecedor excluído com sucesso!");
        fetchSuppliers({});
        setDeleteDialogOpen(false);
        setSupplierToDelete(null);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir fornecedor");
    },
  });

  useEffect(() => {
    fetchSuppliers({});
  }, [fetchSuppliers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [suppliers.length]);

  useEffect(() => {
    const handleSupplierCreated = () => {
      fetchSuppliers({});
    };

    window.addEventListener("supplier-created", handleSupplierCreated);
    return () => {
      window.removeEventListener("supplier-created", handleSupplierCreated);
    };
  }, [fetchSuppliers]);

  const handleDeleteClick = (id: string) => {
    setSupplierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      deleteSupplier({ id: supplierToDelete });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingSupplier(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhum fornecedor cadastrado
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.nome}</TableCell>
                <TableCell>{supplier.email || "-"}</TableCell>
                <TableCell>{supplier.telefone || "-"}</TableCell>
                <TableCell>{supplier.cpfCnpj || "-"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      supplier.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {supplier.isActive ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(supplier.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        totalItems={suppliers.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={TABLE_PAGE_SIZE}
      />

      <SupplierForm
        supplier={editingSupplier}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
