"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
import { getStockForPdvAction } from "@/actions/get-stock-for-pdv";
import { NumericFormat } from "react-number-format";

type Product = {
  id: string;
  productId: string;
  cod: string;
  produto: string;
  undMedida: string;
  quantity: string;
  preco: string | null;
  undMedidaVenda: string;
};

type OrcamentoProductSearchProps = {
  locationId: string;
  onAddToCart: (item: {
    productId: string;
    cod: string;
    produto: string;
    quantity: number;
    undMedida: string;
    precoUnitario: number;
    stockQuantity: number;
  }) => void;
  refreshTrigger?: number;
};

export function OrcamentoProductSearch({
  locationId,
  onAddToCart,
  refreshTrigger,
}: OrcamentoProductSearchProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const { execute: fetchProducts } = useAction(getStockForPdvAction, {
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

  useEffect(() => {
    setIsLoading(true);
    fetchProducts({ locationId });
  }, [locationId, fetchProducts, refreshTrigger]);

  const filteredProducts = products.filter(
    (p) =>
      p.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.produto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: string | null) => {
    if (!price) return "Sem preço";
    const n = parseFloat(price);
    if (Number.isNaN(n)) return "Sem preço";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);
  };

  const formatQuantity = (q: string) => {
    const n = parseFloat(q);
    if (Number.isNaN(n)) return "0";
    return n % 1 === 0 ? n.toString() : n.toFixed(4).replace(/\.?0+$/, "");
  };

  const handleAddToCart = (product: Product) => {
    if (!product.preco) {
      toast.error("Este produto não possui preço cadastrado");
      return;
    }

    const qtyStr = quantities[product.productId] || "1";
    const qty = parseFloat(qtyStr.replace(",", "."));
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Informe uma quantidade válida");
      return;
    }

    const stockQty = parseFloat(product.quantity);
    if (qty > stockQty) {
      toast.error(`Quantidade disponível: ${formatQuantity(product.quantity)} ${product.undMedidaVenda}`);
      return;
    }

    onAddToCart({
      productId: product.productId,
      cod: product.cod,
      produto: product.produto,
      quantity: qty,
      undMedida: product.undMedidaVenda,
      precoUnitario: parseFloat(product.preco),
      stockQuantity: stockQty,
    });

    setQuantities((prev) => ({ ...prev, [product.productId]: "" }));
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 dark:border-slate-700 p-8">
        <div className="text-center text-muted-foreground text-sm">
          Carregando produtos...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Produtos em Estoque
          </p>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? "Nenhum produto encontrado"
                        : "Nenhum produto em estoque"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
                        {product.cod}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.produto}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatQuantity(product.quantity)} {product.undMedidaVenda}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          !product.preco && "text-muted-foreground"
                        )}
                      >
                        {formatPrice(product.preco)}
                      </TableCell>
                      <TableCell>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator=""
                          decimalSeparator=","
                          decimalScale={4}
                          placeholder="1"
                          value={quantities[product.productId] || ""}
                          onValueChange={(values) => {
                            setQuantities((prev) => ({
                              ...prev,
                              [product.productId]: values.value,
                            }));
                          }}
                          className="w-24"
                          disabled={!product.preco}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.preco}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
