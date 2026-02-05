"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  ShoppingCart,
  Mail,
  FileText,
} from "lucide-react";
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
import { getOrcamentosAction } from "@/actions/get-orcamentos";
import { deleteOrcamentoAction } from "@/actions/delete-orcamento";
import { approveOrcamentoAction } from "@/actions/approve-orcamento";
import { rejectOrcamentoAction } from "@/actions/reject-orcamento";
import { convertOrcamentoToVendaAction } from "@/actions/convert-orcamento-to-venda";
import { sendOrcamentoEmailAction } from "@/actions/send-orcamento-email";
import { OrcamentoForm } from "./orcamento-form";
import { OrcamentoPdfViewer } from "./orcamento-pdf-viewer";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OrcamentoRow = {
  id: string;
  codigo: string;
  clientId: string;
  clientNome: string;
  locationId: string;
  locationNome: string;
  total: string;
  observacoes: string | null;
  validade: Date;
  temNota: boolean;
  status: string;
  vendaId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function OrcamentosTable() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrcamento, setEditingOrcamento] = useState<OrcamentoRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [orcamentoToReject, setOrcamentoToReject] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [orcamentoToConvert, setOrcamentoToConvert] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [orcamentoToEmail, setOrcamentoToEmail] = useState<OrcamentoRow | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [orcamentoForPdf, setOrcamentoForPdf] = useState<string | null>(null);

  const paginated = orcamentos.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  const { execute: fetchOrcamentos } = useAction(getOrcamentosAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setOrcamentos(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar orçamentos");
      setIsLoading(false);
    },
  });

  const { execute: deleteOrcamento } = useAction(deleteOrcamentoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Orçamento excluído com sucesso!");
        fetchOrcamentos({});
        setDeleteDialogOpen(false);
        setOrcamentoToDelete(null);
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao excluir orçamento");
      }
    },
    onError: () => {
      toast.error("Erro ao excluir orçamento");
    },
  });

  const { execute: approveOrcamento } = useAction(approveOrcamentoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Orçamento aprovado com sucesso!");
        fetchOrcamentos({});
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao aprovar orçamento");
      }
    },
    onError: () => {
      toast.error("Erro ao aprovar orçamento");
    },
  });

  const { execute: rejectOrcamento } = useAction(rejectOrcamentoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Orçamento recusado com sucesso!");
        fetchOrcamentos({});
        setRejectDialogOpen(false);
        setOrcamentoToReject(null);
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao recusar orçamento");
      }
    },
    onError: () => {
      toast.error("Erro ao recusar orçamento");
    },
  });

  const { execute: convertOrcamento } = useAction(convertOrcamentoToVendaAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(`Orçamento convertido em venda! Código da venda: ${data.codigo}`);
        fetchOrcamentos({});
        setConvertDialogOpen(false);
        setOrcamentoToConvert(null);
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao converter orçamento");
      }
    },
    onError: () => {
      toast.error("Erro ao converter orçamento");
    },
  });

  const { execute: sendEmail } = useAction(sendOrcamentoEmailAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Orçamento enviado por email com sucesso!");
        setEmailDialogOpen(false);
        setEmailAddress("");
        setOrcamentoToEmail(null);
      } else {
        toast.error((data as { error?: string })?.error || "Erro ao enviar email");
      }
      setIsSendingEmail(false);
    },
    onError: () => {
      toast.error("Erro ao enviar email");
      setIsSendingEmail(false);
    },
    onExecute: () => setIsSendingEmail(true),
  });

  useEffect(() => {
    fetchOrcamentos({});
  }, [fetchOrcamentos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [orcamentos.length]);

  useEffect(() => {
    const handleOrcamentoCreated = () => {
      fetchOrcamentos({});
    };
    window.addEventListener("orcamento-created", handleOrcamentoCreated);
    return () => window.removeEventListener("orcamento-created", handleOrcamentoCreated);
  }, [fetchOrcamentos]);

  const handleDeleteClick = (id: string) => {
    setOrcamentoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (orcamentoToDelete) deleteOrcamento({ id: orcamentoToDelete });
  };

  const handleEdit = (row: OrcamentoRow) => {
    setEditingOrcamento(row);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) setEditingOrcamento(null);
  };

  const handleRejectClick = (id: string) => {
    setOrcamentoToReject(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (orcamentoToReject) rejectOrcamento({ id: orcamentoToReject });
  };

  const handleConvertClick = (id: string) => {
    setOrcamentoToConvert(id);
    setConvertDialogOpen(true);
  };

  const handleConvertConfirm = () => {
    if (orcamentoToConvert) convertOrcamento({ id: orcamentoToConvert });
  };

  const handleEmailClick = (row: OrcamentoRow) => {
    setOrcamentoToEmail(row);
    setEmailAddress("");
    setEmailDialogOpen(true);
  };

  const handleEmailSend = () => {
    if (!orcamentoToEmail || !emailAddress.trim()) {
      toast.error("Informe um email válido");
      return;
    }
    sendEmail({ orcamentoId: orcamentoToEmail.id, email: emailAddress.trim() });
  };

  const handlePdfClick = (id: string) => {
    setOrcamentoForPdf(id);
    setPdfViewerOpen(true);
  };

  const formatPrice = (price: string) => {
    const n = parseFloat(price);
    if (Number.isNaN(n)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string, validade: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validadeDate = new Date(validade);
    validadeDate.setHours(0, 0, 0, 0);

    if (status === "vencido" || (status === "pendente" && validadeDate < hoje)) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Vencido
        </span>
      );
    }

    const statusConfig: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
      pendente: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        darkBg: "dark:bg-amber-900",
        darkText: "dark:text-amber-200",
      },
      aprovado: {
        bg: "bg-green-100",
        text: "text-green-800",
        darkBg: "dark:bg-green-900",
        darkText: "dark:text-green-200",
      },
      recusado: {
        bg: "bg-red-100",
        text: "text-red-800",
        darkBg: "dark:bg-red-900",
        darkText: "dark:text-red-200",
      },
      convertido: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        darkBg: "dark:bg-blue-900",
        darkText: "dark:text-blue-200",
      },
    };

    const config = statusConfig[status] || statusConfig.pendente;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${config.darkBg} ${config.darkText}`}
      >
        {status === "pendente"
          ? "Pendente"
          : status === "aprovado"
            ? "Aprovado"
            : status === "recusado"
              ? "Recusado"
              : "Convertido"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Carregando orçamentos...
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orcamentos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Nenhum orçamento cadastrado
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {row.codigo}
                </TableCell>
                <TableCell className="font-medium">{row.clientNome}</TableCell>
                <TableCell>{row.locationNome}</TableCell>
                <TableCell className="tabular-nums font-medium">
                  {formatPrice(row.total)}
                </TableCell>
                <TableCell>{formatDate(row.validade)}</TableCell>
                <TableCell>{getStatusBadge(row.status, row.validade)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEdit(row)}
                        disabled={row.status !== "pendente"}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => approveOrcamento({ id: row.id })}
                        disabled={row.status !== "pendente"}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRejectClick(row.id)}
                        disabled={row.status !== "pendente"}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Recusar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleConvertClick(row.id)}
                        disabled={row.status !== "aprovado"}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Converter em Venda
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEmailClick(row)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar por Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handlePdfClick(row.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizar/PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(row.id)}
                        className="text-red-600 dark:text-red-400"
                        disabled={row.status !== "pendente" && row.status !== "recusado"}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
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
      {orcamentos.length > 0 && (
        <div className="px-4 pb-4">
          <TablePagination
            totalItems={orcamentos.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={TABLE_PAGE_SIZE}
          />
        </div>
      )}

      <OrcamentoForm
        orcamento={editingOrcamento}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
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

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar orçamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja recusar este orçamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectConfirm}>
              Recusar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter em venda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja converter este orçamento em venda? O estoque será baixado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertConfirm}>
              Converter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Orçamento por Email</DialogTitle>
            <DialogDescription>
              Informe o email para enviar o orçamento {orcamentoToEmail?.codigo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email do destinatário</label>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEmailDialogOpen(false);
                setEmailAddress("");
                setOrcamentoToEmail(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEmailSend} disabled={isSendingEmail || !emailAddress.trim()}>
              {isSendingEmail ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pdfViewerOpen && orcamentoForPdf && (
        <OrcamentoPdfViewer
          orcamentoId={orcamentoForPdf}
          onClose={() => {
            setPdfViewerOpen(false);
            setOrcamentoForPdf(null);
          }}
        />
      )}
    </>
  );
}
