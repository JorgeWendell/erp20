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
import { getGroupsAction } from "@/actions/get-groups";
import { deleteGroupAction } from "@/actions/delete-group";
import { GroupForm } from "./group-form";

type Group = {
  id: string;
  cod: string;
  nome: string;
  createdAt: Date;
  updatedAt: Date;
};

export function GroupsTable() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const paginated = groups.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const { execute: fetchGroups } = useAction(getGroupsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setGroups(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar grupos");
      setIsLoading(false);
    },
  });

  const { execute: deleteGroup } = useAction(deleteGroupAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Grupo excluído com sucesso!");
        fetchGroups({});
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir grupo");
    },
  });

  useEffect(() => {
    fetchGroups({});
  }, [fetchGroups]);

  useEffect(() => {
    setCurrentPage(1);
  }, [groups.length]);

  useEffect(() => {
    const handleGroupCreated = () => {
      fetchGroups({});
    };

    window.addEventListener("group-created", handleGroupCreated);
    return () => {
      window.removeEventListener("group-created", handleGroupCreated);
    };
  }, [fetchGroups]);

  const handleDeleteClick = (id: string) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (groupToDelete) {
      deleteGroup({ id: groupToDelete });
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingGroup(null);
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
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                Nenhum grupo cadastrado
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.cod}</TableCell>
                <TableCell>{group.nome}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(group)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(group.id)}
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
        totalItems={groups.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={TABLE_PAGE_SIZE}
      />

      <GroupForm
        group={editingGroup}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.
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
