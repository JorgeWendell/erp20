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
import { getPricingAction } from "@/actions/get-pricing";
import { deletePricingAction } from "@/actions/delete-pricing";
import { PricingForm, type PricingRow } from "./pricing-form";

type PricingItem = PricingRow;

export function PricingTable({ locationId }: { locationId: string | null }) {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPricing, setEditingPricing] = useState<PricingItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pricingToDelete, setPricingToDelete] = useState<string | null>(null);

  const paginated = pricing.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  const { execute: fetchPricing } = useAction(getPricingAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setPricing(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar precificações");
      setIsLoading(false);
    },
  });

  const { execute: deletePricing } = useAction(deletePricingAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Precificação excluída com sucesso!");
        fetchPricing({ locationId: locationId || undefined });
        setDeleteDialogOpen(false);
        setPricingToDelete(null);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir precificação");
    },
  });

  useEffect(() => {
    if (locationId) {
      setIsLoading(true);
      fetchPricing({ locationId });
    } else {
      setPricing([]);
      setIsLoading(false);
    }
  }, [locationId, fetchPricing]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pricing.length]);

  useEffect(() => {
    const handlePricingCreated = () => {
      if (locationId) {
        fetchPricing({ locationId });
      }
    };

    window.addEventListener("pricing-created", handlePricingCreated);
    return () => {
      window.removeEventListener("pricing-created", handlePricingCreated);
    };
  }, [locationId, fetchPricing]);

  const handleDeleteClick = (id: string) => {
    setPricingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (pricingToDelete) {
      deletePricing({ id: pricingToDelete });
    }
  };

  const handleEdit = (pricingItem: PricingItem) => {
    setEditingPricing(pricingItem);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingPricing(null);
    }
  };

  const formatPrice = (price: string) => {
    const n = parseFloat(price);
    if (Number.isNaN(n)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Carregando precificações...
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Unidade de Venda</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricing.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                Nenhuma precificação cadastrada para este local
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {row.grupoCod && row.subgrupoCod
                    ? `${row.grupoCod} — ${row.subgrupoCod} — ${row.productCod}`
                    : row.productCod}
                </TableCell>
                <TableCell className="font-medium">{row.productNome}</TableCell>
                <TableCell className="tabular-nums font-medium">
                  {formatPrice(row.preco)}
                </TableCell>
                <TableCell>{row.undMedidaVenda}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(row)}>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pricing.length > 0 && (
        <div className="px-4 pb-4">
          <TablePagination
            totalItems={pricing.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={TABLE_PAGE_SIZE}
          />
        </div>
      )}

      <PricingForm
        pricing={editingPricing}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        locationId={locationId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta precificação? Esta ação não pode ser desfeita.
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
    </>
  );
}
