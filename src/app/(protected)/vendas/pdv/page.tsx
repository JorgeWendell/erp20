import { CreditCard } from "lucide-react";

export default function PDVPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
          <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          PDV
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ponto de venda
        </p>
      </div>
    </div>
  );
}
