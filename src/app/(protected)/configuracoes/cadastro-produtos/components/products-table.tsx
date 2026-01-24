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
import { getProductsAction } from "@/actions/get-products";
import { deleteProductAction } from "@/actions/delete-product";
import { ProductForm } from "./product-form";

type Product = {
  id: string;
  cod: string;
  nome: string;
  undMedida: string;
  referencia1: string | null;
  referencia2: string | null;
  grupoId: string;
  grupoNome: string | null;
  subgrupoId: string;
  subgrupoNome: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const paginated = products.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  const { execute: fetchProducts } = useAction(getProductsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setProducts(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar produtos");
      setIsLoading(false);
    },
  });

  const { execute: deleteProduct } = useAction(deleteProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Produto excluído com sucesso!");
        fetchProducts({});
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir produto");
    },
  });

  useEffect(() => {
    fetchProducts({});
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  useEffect(() => {
    const handleProductCreated = () => {
      fetchProducts({});
    };

    window.addEventListener("product-created", handleProductCreated);
    return () => {
      window.removeEventListener("product-created", handleProductCreated);
    };
  }, [fetchProducts]);

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct({ id: productToDelete });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
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
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Subgrupo</TableHead>
            <TableHead>Referência 1</TableHead>
            <TableHead>Referência 2</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum produto cadastrado
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.cod}</TableCell>
                <TableCell>{product.nome}</TableCell>
                <TableCell>{product.grupoNome || "-"}</TableCell>
                <TableCell>{product.subgrupoNome || "-"}</TableCell>
                <TableCell>{product.referencia1 || "-"}</TableCell>
                <TableCell>{product.referencia2 || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(product.id)}
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
        totalItems={products.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={TABLE_PAGE_SIZE}
      />

      <ProductForm
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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
