"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Factory,
  Package,
  Settings,
  BarChart3,
  HelpCircle,
  Wrench,
  ShoppingCart,
  Store,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavItemWithChildren = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  children: { name: string; href: string }[];
};

const navigationItems: (NavItem | NavItemWithChildren)[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Produção",
    href: "/producao",
    icon: Factory,
  },
  {
    name: "Estoque",
    href: "/estoque",
    icon: Package,
  },
  {
    name: "Compras",
    href: "/compras",
    icon: ShoppingCart,
  },
  {
    name: "Vendas",
    icon: Store,
    children: [
      { name: "Orçamento", href: "/vendas/orcamento" },
      { name: "PDV", href: "/vendas/pdv" },
    ],
  },
  {
    name: "Engenharia",
    href: "/engenharia",
    icon: Wrench,
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
];

const utilityItems = [
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
  {
    name: "Suporte",
    href: "/suporte",
    icon: HelpCircle,
  },
];

function isNavItemWithChildren(
  item: NavItem | NavItemWithChildren
): item is NavItemWithChildren {
  return "children" in item && Array.isArray(item.children);
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [vendasOpen, setVendasOpen] = useState(() =>
    pathname.startsWith("/vendas")
  );

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 p-6">
        <Image
          src={theme === "dark" ? "/logo.png" : "/logo2.png"}
          alt="ERP Industrial Logo"
          width={150}
          height={150}
          priority
          unoptimized
          className="justify-center items-center mx-auto"          
          
        />
        <div className="flex flex-col">
          
          
        </div>
      </div>

      <nav className="flex flex-1 flex-col px-4 py-6">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (isNavItemWithChildren(item)) {
              const Icon = item.icon;
              const isOpen = item.name === "Vendas" ? vendasOpen : false;
              const hasActiveChild = item.children.some(
                (child) => pathname === child.href
              );

              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() =>
                      item.name === "Vendas"
                        ? setVendasOpen(!vendasOpen)
                        : undefined
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                      hasActiveChild
                        ? "bg-blue-600/10 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                              isChildActive
                                ? "bg-blue-600 text-white -ml-px pl-3 border-l-2 border-blue-600"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const navItem = item as NavItem;
            const isActive = pathname === navItem.href;
            const Icon = navItem.icon;

            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{navItem.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-1 border-t border-slate-200 dark:border-slate-800 pt-6">
          {utilityItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
