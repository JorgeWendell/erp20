"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getStockByProductAction } from "@/actions/get-stock-by-product";
import { upsertStockAction } from "@/actions/upsert-stock";
import { deleteStockAction } from "@/actions/delete-stock";
import { getLocationsAction } from "@/actions/get-locations";

type StockRow = {
  id: string;
  productId: string;
  locationId: string;
  locationNome: string | null;
  quantity: string;
};

type Location = {
  id: string;
  nome: string;
};

export function ProductFormLocationsTab({
  productId,
  undMedida,
}: {
  productId: string;
  undMedida: string;
}) {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = stock.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  const { execute: fetchStock } = useAction(getStockByProductAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setStock(data.data);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar estoque");
      setIsLoading(false);
    },
  });

  const { execute: fetchLocations } = useAction(getLocationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setLocations(data.data);
    },
    onError: () => toast.error("Erro ao carregar locais"),
  });

  const { execute: upsertStock } = useAction(upsertStockAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(editingStock ? "Estoque atualizado." : "Local adicionado.");
        setAddDialogOpen(false);
        setEditingStock(null);
        setLocationId("");
        setQuantity("");
        fetchStock({ productId });
      }
    },
    onError: ({ error }) => toast.error(error.serverError || "Erro ao salvar"),
    onExecute: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
  });

  const { execute: deleteStock } = useAction(deleteStockAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Removido.");
        setDeleteDialogOpen(false);
        setStockToDelete(null);
        fetchStock({ productId });
      }
    },
    onError: () => toast.error("Erro ao remover"),
  });

  useEffect(() => {
    fetchStock({ productId });
    fetchLocations({});
  }, [productId, fetchStock, fetchLocations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [stock.length]);

  const openAdd = () => {
    setEditingStock(null);
    setLocationId("");
    setQuantity("");
    setAddDialogOpen(true);
  };

  const openEdit = (row: StockRow) => {
    setEditingStock(row);
    setLocationId(row.locationId);
    setQuantity(row.quantity);
    setAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!locationId.trim()) {
      toast.error("Selecione um local.");
      return;
    }
    const q = quantity.trim();
    if (q === "" || parseFloat(q) < 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }
    upsertStock({ productId, locationId, quantity: q });
  };

  const openDelete = (id: string) => {
    setStockToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (stockToDelete) deleteStock({ id: stockToDelete });
  };

  const formatQty = (q: string) => {
    const n = parseFloat(q);
    if (Number.isNaN(n)) return "0";
    return n % 1 === 0 ? n.toString() : n.toFixed(4).replace(/\.?0+$/, "");
  };

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground text-sm">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar local
        </Button>
      </div>
      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Local</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                  Nenhum local. Clique em &quot;Adicionar local&quot;.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {row.locationNome ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatQty(row.quantity)}</TableCell>
                  <TableCell className="text-muted-foreground">{undMedida}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete(row.id)}
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
      </div>
      {stock.length > 0 && (
        <TablePagination
          totalItems={stock.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={TABLE_PAGE_SIZE}
        />
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingStock ? "Editar quantidade" : "Adicionar local"}</DialogTitle>
            <DialogDescription>
              {editingStock
                ? "Altere a quantidade no local."
                : "Selecione o local e informe a quantidade."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Local</label>
              <Select
                value={locationId}
                onValueChange={setLocationId}
                disabled={!!editingStock}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quantidade</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Unidade de medida</label>
              <Input value={undMedida} disabled className="bg-muted" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover local</AlertDialogTitle>
            <AlertDialogDescription>
              Remove a quantidade deste local para o produto. Confirma?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
