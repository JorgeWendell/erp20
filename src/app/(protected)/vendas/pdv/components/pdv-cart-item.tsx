"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "./pdv-content";

type PdvCartItemProps = {
  item: CartItem;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
};

export function PdvCartItem({
  item,
  onUpdate,
  onRemove,
}: PdvCartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity.toString());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    const qty = parseFloat(value.replace(",", "."));
    if (!Number.isNaN(qty) && qty > 0) {
      onUpdate(qty);
    }
  };

  const handleBlur = () => {
    const qty = parseFloat(quantity.replace(",", "."));
    if (Number.isNaN(qty) || qty <= 0) {
      setQuantity(item.quantity.toString());
      onUpdate(item.quantity);
    } else {
      onUpdate(qty);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {item.produto}
          </p>
          <p className="text-xs text-muted-foreground font-mono">{item.cod}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Preço:</span>
          <p className="font-medium">{formatPrice(item.precoUnitario)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Subtotal:</span>
          <p className="font-medium">{formatPrice(item.subtotal)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Qtd:</span>
        <NumericFormat
          customInput={Input}
          thousandSeparator=""
          decimalSeparator=","
          decimalScale={4}
          value={quantity}
          onValueChange={(values) => handleQuantityChange(values.value)}
          onBlur={handleBlur}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">{item.undMedida}</span>
      </div>
    </div>
  );
}
