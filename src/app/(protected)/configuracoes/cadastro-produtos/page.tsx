import { ProductForm } from "./components/product-form";
import { ProductsTable } from "./components/products-table";

export default function CadastroProdutosPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cadastro de Produtos
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cadastre e gerencie os produtos da organização
          </p>
        </div>
        <ProductForm />
      </div>
      <ProductsTable />
    </div>
  );
}
