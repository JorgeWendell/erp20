"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
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
import { getComprasAction } from "@/actions/get-compras";
import { deleteCompraAction } from "@/actions/delete-compra";
import { approveCompraAction } from "@/actions/approve-compra";
import { rejectCompraAction } from "@/actions/reject-compra";
import { CompraForm, type CompraRow } from "./compra-form";

type CompraItem = CompraRow;

export function ComprasTable() {
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCompra, setEditingCompra] = useState<CompraItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [compraToDelete, setCompraToDelete] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [compraToReject, setCompraToReject] = useState<string | null>(null);

  const paginated = compras.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  const { execute: fetchCompras } = useAction(getComprasAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setCompras(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar compras");
      setIsLoading(false);
    },
  });

  const { execute: deleteCompra } = useAction(deleteCompraAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Compra excluída com sucesso!");
        fetchCompras({});
        setDeleteDialogOpen(false);
        setCompraToDelete(null);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir compra");
    },
  });

  const { execute: approveCompra } = useAction(approveCompraAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Compra aprovada com sucesso!");
        fetchCompras({});
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao aprovar compra");
      }
    },
    onError: () => {
      toast.error("Erro ao aprovar compra");
    },
  });

  const { execute: rejectCompra } = useAction(rejectCompraAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Compra reprovada com sucesso!");
        fetchCompras({});
        setRejectDialogOpen(false);
        setCompraToReject(null);
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao reprovar compra");
      }
    },
    onError: () => {
      toast.error("Erro ao reprovar compra");
    },
  });

  useEffect(() => {
    fetchCompras({});
  }, [fetchCompras]);

  useEffect(() => {
    const handleCompraCreated = () => {
      fetchCompras({});
    };
    window.addEventListener("compra-created", handleCompraCreated);
    return () => window.removeEventListener("compra-created", handleCompraCreated);
  }, [fetchCompras]);

  useEffect(() => {
    setCurrentPage(1);
  }, [compras.length]);

  const handleDeleteClick = (id: string) => {
    setCompraToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (compraToDelete) deleteCompra({ id: compraToDelete });
  };

  const handleEdit = (row: CompraItem) => {
    setEditingCompra(row);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) setEditingCompra(null);
  };

  const handleRejectClick = (id: string) => {
    setCompraToReject(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (compraToReject) rejectCompra({ id: compraToReject });
  };

  const formatQuantity = (q: string) => {
    const n = parseFloat(q);
    if (Number.isNaN(n)) return "0";
    return n % 1 === 0 ? n.toString() : n.toFixed(4).replace(/\.?0+$/, "");
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Carregando compras...
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Código completo</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Local de entrega</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compras.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center py-8 text-muted-foreground"
              >
                Nenhuma compra cadastrada
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {row.codigo}
                </TableCell>
                <TableCell className="text-sm">
                  {row.grupoCod} — {row.subgrupoCod} — {row.productCod}
                </TableCell>
                <TableCell className="font-medium">{row.productNome}</TableCell>
                <TableCell>{row.supplierNome}</TableCell>
                <TableCell>{row.undMedida}</TableCell>
                <TableCell className="tabular-nums">
                  {formatQuantity(row.quantity)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.temNota
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {row.temNota ? "Com nota" : "Sem nota"}
                  </span>
                </TableCell>
                <TableCell>{row.locationNome}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.status === "aprovado"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : row.status === "reprovado"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : row.status === "entregue"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {row.status === "pendente"
                      ? "Pendente"
                      : row.status === "aprovado"
                        ? "Aprovado"
                        : row.status === "reprovado"
                          ? "Reprovado"
                          : "Entregue"}
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
                      <DropdownMenuItem
                        onClick={() => handleEdit(row)}
                        disabled={row.status !== "pendente"}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(row.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => approveCompra({ id: row.id })}
                        disabled={row.status !== "pendente"}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRejectClick(row.id)}
                        disabled={row.status !== "pendente"}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reprovar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {compras.length > 0 && (
        <div className="px-4 pb-4">
          <TablePagination
            totalItems={compras.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={TABLE_PAGE_SIZE}
          />
        </div>
      )}

      <CompraForm
        compra={editingCompra}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita.
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

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprovar compra</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reprovar esta compra?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectConfirm}>
              Reprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
