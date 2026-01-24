import { ClientForm } from "./components/client-form";
import { ClientsTable } from "./components/clients-table";

export default function CadastroClientesPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cadastro de Clientes
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cadastre e gerencie os clientes da organização
          </p>
        </div>
        <ClientForm />
      </div>
      <ClientsTable />
    </div>
  );
}
