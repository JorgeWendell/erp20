"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLocationsAction } from "@/actions/get-locations";
import { PricingTable } from "./components/pricing-table";
import { PricingForm } from "./components/pricing-form";

type Location = {
  id: string;
  nome: string;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function PrecificacaoPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { execute: fetchLocations } = useAction(getLocationsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setLocations(data.data);
      }
      setIsLoadingLocations(false);
    },
    onError: () => {
      toast.error("Erro ao carregar locais");
      setIsLoadingLocations(false);
    },
  });

  useEffect(() => {
    fetchLocations({});
  }, [fetchLocations]);

  if (isLoadingLocations) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Carregando locais...
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Precificação
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Defina preços e unidades de medida para produtos em estoque
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-muted-foreground">
          Nenhum local cadastrado. Cadastre locais em Configurações → Cadastro de
          Locais.
        </div>
      </div>
    );
  }

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Precificação
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Defina preços e unidades de medida para produtos em estoque
        </p>
      </div>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setFormOpen(true)}
            disabled={!selectedLocationId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova precificação
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <Button
              key={loc.id}
              variant="outline"
              onClick={() => setSelectedLocationId(loc.id)}
              className={cn(
                "transition-colors",
                selectedLocationId === loc.id
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white hover:border-blue-700"
                  : "bg-transparent border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {loc.nome}
            </Button>
          ))}
        </div>

        {selectedLocation && (
          <div className="rounded-md border border-slate-200 dark:border-slate-700">
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Precificações — {selectedLocation.nome}
              </p>
            </div>
            <PricingTable locationId={selectedLocationId} />
          </div>
        )}

        <PricingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          locationId={selectedLocationId}
        />
      </div>
    </div>
  );
}
