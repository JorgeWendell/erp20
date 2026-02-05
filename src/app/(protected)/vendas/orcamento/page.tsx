import { FileText } from "lucide-react";
import { OrcamentoContent } from "./components/orcamento-content";
import { OrcamentosTable } from "./components/orcamentos-table";

export default function OrcamentoPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          ORÇAMENTO
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Crie e gerencie orçamentos de vendas
        </p>
      </div>
      <div className="space-y-6">
        <OrcamentoContent />
        <div className="rounded-md border border-slate-200 dark:border-slate-700">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Orçamentos Criados
            </p>
          </div>
          <OrcamentosTable />
        </div>
      </div>
    </div>
  );
}
