import Link from "next/link";
import { Users, Shield, Briefcase, ChevronRight, Building2, Truck, MapPin, FolderTree, Package } from "lucide-react";

export default function Configuracoes() {
  return (
    <div className="p-6">
      <div className="space-y-3">
        <Link
          href="/configuracoes/gestao-usuarios"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Gestão de usuários
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie usuários, perfis e acessos ao sistema
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/gestao-permissoes"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Gestão de permissões
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure permissões e níveis de acesso por usuário
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/gestao-cargos"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Gestão de Cargos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie cargos, funções e hierarquias organizacionais
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/cadastro-clientes"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cadastro de Clientes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie o cadastro de clientes e informações comerciais
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/cadastro-fornecedores"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cadastro de Fornecedores
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie o cadastro de fornecedores e informações comerciais
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/cadastro-locais"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <MapPin className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cadastro de Locais
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie o cadastro de locais e endereços
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/grupos-subgrupos"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
            <FolderTree className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Grupos e Subgrupos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie grupos e subgrupos do sistema
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>

        <Link
          href="/configuracoes/cadastro-produtos"
          className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cadastro de Produtos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie o cadastro de produtos e referências
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>
      </div>
    </div>
  );
}
