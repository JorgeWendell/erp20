"use client";

import { Button } from "@/components/ui/button";
import { ComprasTable } from "./compras-table";
import { CompraForm } from "./compra-form";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ComprasContent() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova compra
        </Button>
      </div>
      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Pedidos de compra
          </p>
        </div>
        <ComprasTable />
      </div>
      <CompraForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
