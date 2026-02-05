"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { getLocationsAction } from "@/actions/get-locations";
import { PdvProductSearch } from "./pdv-product-search";
import { PdvCart } from "./pdv-cart";

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

export type CartItem = {
  id: string;
  productId: string;
  cod: string;
  produto: string;
  quantity: number;
  undMedida: string;
  precoUnitario: number;
  subtotal: number;
  stockQuantity: number;
};

export function PdvContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [refreshStockTrigger, setRefreshStockTrigger] = useState(0);

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

  useEffect(() => {
    fetchLocations({});
  }, [fetchLocations]);

  useEffect(() => {
    if (!selectedLocationId) {
      setCart([]);
    }
  }, [selectedLocationId]);

  const addToCart = (item: {
    productId: string;
    cod: string;
    produto: string;
    quantity: number;
    undMedida: string;
    precoUnitario: number;
    stockQuantity: number;
  }) => {
    const existingItem = cart.find(
      (cartItem) =>
        cartItem.productId === item.productId &&
        cartItem.undMedida === item.undMedida
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + item.quantity;
      if (newQuantity > item.stockQuantity) {
        toast.error(
          `Quantidade disponível: ${item.stockQuantity} ${item.undMedida}`
        );
        return;
      }
      setCart(
        cart.map((cartItem) =>
          cartItem.id === existingItem.id
            ? {
                ...cartItem,
                quantity: newQuantity,
                subtotal: newQuantity * item.precoUnitario,
              }
            : cartItem
        )
      );
    } else {
      if (item.quantity > item.stockQuantity) {
        toast.error(
          `Quantidade disponível: ${item.stockQuantity} ${item.undMedida}`
        );
        return;
      }
      setCart([
        ...cart,
        {
          id: `${item.productId}-${item.undMedida}`,
          ...item,
          subtotal: item.quantity * item.precoUnitario,
        },
      ]);
    }
    toast.success("Produto adicionado ao carrinho");
  };

  const updateCartItem = (id: string, quantity: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    if (quantity > item.stockQuantity) {
      toast.error(
        `Quantidade disponível: ${item.stockQuantity} ${item.undMedida}`
      );
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.id === id
          ? {
              ...cartItem,
              quantity,
              subtotal: quantity * cartItem.precoUnitario,
            }
          : cartItem
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
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

      {selectedLocationId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PdvProductSearch
              locationId={selectedLocationId}
              onAddToCart={addToCart}
              refreshTrigger={refreshStockTrigger}
            />
          </div>
          <div className="lg:col-span-1">
            <PdvCart
              cart={cart}
              locationId={selectedLocationId}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onRefreshStock={() => setRefreshStockTrigger((prev) => prev + 1)}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-muted-foreground">
          Selecione um local para começar a vender
        </div>
      )}
    </div>
  );
}
