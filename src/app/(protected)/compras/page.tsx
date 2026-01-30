import { ShoppingCart } from "lucide-react";
import { ComprasContent } from "./components/compras-content";

export default function ComprasPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
          <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          COMPRAS
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Consulte e gerencie os pedidos de compra
        </p>
      </div>
      <ComprasContent />
    </div>
  );
}
