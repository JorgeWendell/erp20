"use client";

import { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdvCartItem } from "./pdv-cart-item";
import { PdvCheckout } from "./pdv-checkout";
import type { CartItem } from "./pdv-content";

type PdvCartProps = {
  cart: CartItem[];
  locationId: string;
  onUpdateItem: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onRefreshStock: () => void;
};

export function PdvCart({
  cart,
  locationId,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onRefreshStock,
}: PdvCartProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <>
      <div className="rounded-md border border-slate-200 dark:border-slate-700 sticky top-6">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Carrinho ({cart.length})
          </p>
        </div>
        <div className="p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Carrinho vazio
            </div>
          ) : (
            <>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <PdvCartItem
                    key={item.id}
                    item={item}
                    onUpdate={(quantity) => onUpdateItem(item.id, quantity)}
                    onRemove={() => onRemoveItem(item.id)}
                  />
                ))}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearCart}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                  <Button
                    onClick={() => setCheckoutOpen(true)}
                    className="flex-1"
                    disabled={cart.length === 0}
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PdvCheckout
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cart}
        locationId={locationId}
        total={total}
        onSuccess={() => {
          onClearCart();
          onRefreshStock();
        }}
      />
    </>
  );
}
