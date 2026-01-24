"use client";

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
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const navigationItems = [
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

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();

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
