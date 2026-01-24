import { SupplierForm } from "./components/supplier-form";
import { SuppliersTable } from "./components/suppliers-table";

export default function CadastroFornecedoresPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cadastro de Fornecedores
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cadastre e gerencie os fornecedores da organização
          </p>
        </div>
        <SupplierForm />
      </div>
      <SuppliersTable />
    </div>
  );
}
