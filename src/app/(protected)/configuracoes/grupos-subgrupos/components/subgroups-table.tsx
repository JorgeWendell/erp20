"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TablePagination, TABLE_PAGE_SIZE } from "@/components/ui/table-pagination";
import { getSubgroupsAction } from "@/actions/get-subgroups";
import { deleteSubgroupAction } from "@/actions/delete-subgroup";
import { SubgroupForm } from "./subgroup-form";

type Subgroup = {
  id: string;
  cod: string;
  nome: string;
  groupId: string;
  groupNome: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SubgroupForForm = {
  id: string;
  cod: string;
  nome: string;
  groupId: string;
};

export function SubgroupsTable() {
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingSubgroup, setEditingSubgroup] = useState<SubgroupForForm | null>(null);

  const paginated = subgroups.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subgroupToDelete, setSubgroupToDelete] = useState<string | null>(null);

  const { execute: fetchSubgroups } = useAction(getSubgroupsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setSubgroups(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar subgrupos");
      setIsLoading(false);
    },
  });

  const { execute: deleteSubgroup } = useAction(deleteSubgroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Subgrupo excluído com sucesso!");
        fetchSubgroups({});
        setDeleteDialogOpen(false);
        setSubgroupToDelete(null);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir subgrupo");
    },
  });

  useEffect(() => {
    fetchSubgroups({});
  }, [fetchSubgroups]);

  useEffect(() => {
    setCurrentPage(1);
  }, [subgroups.length]);

  useEffect(() => {
    const handleSubgroupCreated = () => {
      fetchSubgroups({});
    };

    window.addEventListener("subgroup-created", handleSubgroupCreated);
    return () => {
      window.removeEventListener("subgroup-created", handleSubgroupCreated);
    };
  }, [fetchSubgroups]);

  const handleDeleteClick = (id: string) => {
    setSubgroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (subgroupToDelete) {
      deleteSubgroup({ id: subgroupToDelete });
    }
  };

  const handleEdit = (subgroup: Subgroup) => {
    setEditingSubgroup({
      id: subgroup.id,
      cod: subgroup.cod,
      nome: subgroup.nome,
      groupId: subgroup.groupId,
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingSubgroup(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>COD</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subgroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum subgrupo cadastrado
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((subgroup) => (
              <TableRow key={subgroup.id}>
                <TableCell className="font-medium">{subgroup.cod}</TableCell>
                <TableCell>{subgroup.nome}</TableCell>
                <TableCell>{subgroup.groupNome || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(subgroup)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(subgroup.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        totalItems={subgroups.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={TABLE_PAGE_SIZE}
      />

      <SubgroupForm
        subgroup={editingSubgroup}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este subgrupo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
