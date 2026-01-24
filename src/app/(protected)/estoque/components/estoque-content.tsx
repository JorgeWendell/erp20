"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination, TABLE_PAGE_SIZE } from "@/components/ui/table-pagination";
import { getLocationsAction } from "@/actions/get-locations";
import { getStockByLocationAction } from "@/actions/get-stock-by-location";

type Location = {
  id: string;
  nome: string;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type EstoqueItem = {
  id: string;
  productId: string;
  cod: string;
  produto: string;
  undMedida: string;
  quantity: string;
};

export function EstoqueContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = estoqueItems.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  const { execute: fetchLocations } = useAction(getLocationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setLocations(data.data);
      }
      setIsLoadingLocations(false);
    },
    onError: () => {
      toast.error("Erro ao carregar locais");
      setIsLoadingLocations(false);
    },
  });

  const { execute: fetchStock } = useAction(getStockByLocationAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setEstoqueItems(data.data);
      }
      setIsLoadingStock(false);
    },
    onError: () => {
      toast.error("Erro ao carregar estoque");
      setIsLoadingStock(false);
    },
  });

  useEffect(() => {
    fetchLocations({});
  }, [fetchLocations]);

  useEffect(() => {
    if (selectedLocationId) {
      setIsLoadingStock(true);
      fetchStock({ locationId: selectedLocationId });
    } else {
      setEstoqueItems([]);
    }
  }, [selectedLocationId, fetchStock]);

  useEffect(() => {
    setCurrentPage(1);
  }, [estoqueItems.length]);

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  const formatQuantity = (q: string) => {
    const n = parseFloat(q);
    if (Number.isNaN(n)) return "0";
    return n % 1 === 0 ? n.toString() : n.toFixed(4).replace(/\.?0+$/, "");
  };

  if (isLoadingLocations) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando locais...
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-muted-foreground">
        Nenhum local cadastrado. Cadastre locais em Configurações → Cadastro de
        Locais.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {locations.map((loc) => (
          <Button
            key={loc.id}
            variant="outline"
            onClick={() => setSelectedLocationId(loc.id)}
            className={cn(
              "transition-colors",
              selectedLocationId === loc.id
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white hover:border-blue-700"
                : "bg-transparent border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {loc.nome}
          </Button>
        ))}
      </div>

      {selectedLocation && (
        <div className="rounded-md border border-slate-200 dark:border-slate-700">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Estoque — {selectedLocation.nome}
            </p>
          </div>
          {isLoadingStock ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Carregando estoque...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Unidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoqueItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum item em estoque neste local
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.cod}</TableCell>
                      <TableCell className="font-medium">{item.produto}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatQuantity(item.quantity)}
                      </TableCell>
                      <TableCell>{item.undMedida}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {!isLoadingStock && estoqueItems.length > 0 && (
            <div className="px-4 pb-4">
              <TablePagination
                totalItems={estoqueItems.length}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={TABLE_PAGE_SIZE}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
