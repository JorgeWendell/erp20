"use client";

import { useEffect, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getOrcamentoPdfDataAction } from "@/actions/get-orcamento-pdf-data";

type OrcamentoPdfViewerProps = {
  orcamentoId: string;
  onClose: () => void;
};

export function OrcamentoPdfViewer({
  orcamentoId,
  onClose,
}: OrcamentoPdfViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orcamento, setOrcamento] = useState<{
    id: string;
    codigo: string;
    clientId: string;
    clientNome: string;
    locationId: string;
    locationNome: string;
    total: string;
    observacoes: string | null;
    validade: Date | string;
    temNota: boolean;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    items: Array<{
      id: string;
      productId: string;
      productCod: string;
      productNome: string;
      grupoCod: string | null;
      subgrupoCod: string | null;
      quantity: string;
      undMedida: string;
      precoUnitario: string;
      subtotal: string;
    }>;
  } | null>(null);

  const { execute: fetchOrcamento } = useAction(getOrcamentoPdfDataAction, {
    onSuccess: ({ data }) => {
      setIsLoading(false);
      if (data?.success && data.data) {
        setOrcamento(data.data);
        setError(null);
      } else {
        const errorMsg = (data as { error?: string })?.error || "Erro ao carregar dados do orçamento";
        setError(errorMsg);
        setOrcamento(null);
        toast.error(errorMsg);
      }
    },
    onError: ({ error: actionError }) => {
      setIsLoading(false);
      const errorMsg =
        typeof actionError === "string"
          ? actionError
          : actionError?.serverError || "Erro ao carregar dados do orçamento";
      setError(errorMsg);
      setOrcamento(null);
      toast.error(errorMsg);
    },
  });

  useEffect(() => {
    if (orcamentoId) {
      setIsLoading(true);
      setError(null);
      setOrcamento(null);
      fetchOrcamento({ orcamentoId });
    } else {
      setIsLoading(false);
      setError("ID do orçamento não fornecido");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orcamentoId]);

  const formatPrice = (price: string) => {
    const n = parseFloat(price);
    if (Number.isNaN(n)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleGeneratePDF = async () => {
    if (!contentRef.current || !orcamento) return;

    try {
      toast.info("Gerando PDF...");
      
      const buildSimpleHTML = () => {
        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>';
        html += '* { margin: 0; padding: 0; box-sizing: border-box; }';
        html += 'body { font-family: Arial, sans-serif; background-color: #ffffff; color: #000000; }';
        html += '</style></head><body>';
        html += '<div style="background-color: #ffffff; color: #000000; padding: 20px; max-height: 1100px; display: flex; flex-direction: column;">';
        html += '<div style="text-align: right; margin-bottom: 16px;">';
        html += '<img src="/logo2.png" alt="Logo" style="max-height: 60px; height: auto;" />';
        html += '</div>';
        html += '<div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 12px;">';
        html += `<h1 style="font-size: 22px; font-weight: bold; color: #2563eb; margin-bottom: 6px;">ORÇAMENTO</h1>`;
        html += `<p style="color: #4b5563; font-size: 14px;">Código: ${orcamento.codigo}</p>`;
        html += '</div>';
        
        html += '<div style="margin-bottom: 16px;">';
        html += '<h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">Dados do Cliente</h2>';
        html += '<div style="color: #374151; font-size: 13px;">';
        html += `<p style="margin-bottom: 4px;"><strong>Nome:</strong> ${orcamento.clientNome}</p>`;
        html += `<p style="margin-bottom: 4px;"><strong>Local:</strong> ${orcamento.locationNome}</p>`;
        html += `<p style="margin-bottom: 4px;"><strong>Validade:</strong> ${formatDate(orcamento.validade)}</p>`;
        html += `<p style="margin-bottom: 4px;"><strong>Data de Emissão:</strong> ${formatDate(orcamento.createdAt)}</p>`;
        html += '</div></div>';
        
        html += '<div style="margin-bottom: 16px;">';
        html += '<h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">Itens do Orçamento</h2>';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        html += '<thead><tr style="background-color: #f3f4f6;">';
        html += '<th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Código</th>';
        html += '<th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Produto</th>';
        html += '<th style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">Quantidade</th>';
        html += '<th style="border: 1px solid #d1d5db; padding: 6px; text-align: right;">Preço Unit.</th>';
        html += '<th style="border: 1px solid #d1d5db; padding: 6px; text-align: right;">Subtotal</th>';
        html += '</tr></thead><tbody>';
        
        orcamento.items.forEach((item) => {
          html += '<tr>';
          html += `<td style="border: 1px solid #d1d5db; padding: 6px;">${item.productCod}</td>`;
          html += `<td style="border: 1px solid #d1d5db; padding: 6px;">${item.productNome}</td>`;
          html += `<td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${item.quantity} ${item.undMedida}</td>`;
          html += `<td style="border: 1px solid #d1d5db; padding: 6px; text-align: right;">${formatPrice(item.precoUnitario)}</td>`;
          html += `<td style="border: 1px solid #d1d5db; padding: 6px; text-align: right;">${formatPrice(item.subtotal)}</td>`;
          html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        html += '<div style="margin-top: 16px; padding-top: 12px; border-top: 2px solid #d1d5db;">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center;">';
        html += '<span style="font-size: 16px; font-weight: bold; color: #1f2937;">Total:</span>';
        html += `<span style="font-size: 20px; font-weight: bold; color: #2563eb;">${formatPrice(orcamento.total)}</span>`;
        html += '</div></div>';
        
        if (orcamento.observacoes) {
          html += '<div style="margin-top: 16px; padding: 12px; background-color: #f9fafb; border-left: 4px solid #2563eb;">';
          html += '<h3 style="font-weight: bold; margin-bottom: 6px; color: #1f2937; font-size: 14px;">Observações</h3>';
          html += `<p style="color: #374151; white-space: pre-wrap; font-size: 12px;">${orcamento.observacoes}</p>`;
          html += '</div>';
        }
        
        html += '<div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #d1d5db; text-align: center; font-size: 11px; color: #6b7280;">';
        html += '<p style="margin-bottom: 4px;">Este é um orçamento gerado automaticamente pelo sistema ERP.</p>';
        html += `<p>Validade: ${formatDate(orcamento.validade)}</p>`;
        html += '</div>';
        
        html += '</div></body></html>';
        return html;
      };
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '800px';
      iframe.style.height = '1200px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      await new Promise<void>((resolve, reject) => {
        iframe.onload = async () => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) {
              throw new Error('Não foi possível acessar o documento do iframe');
            }
            
            iframeDoc.open();
            iframeDoc.write(buildSimpleHTML());
            iframeDoc.close();
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const canvas = await html2canvas(iframeDoc.body, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
              allowTaint: false,
            });
            
            document.body.removeChild(iframe);
            
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight <= pdfHeight) {
              pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            } else {
              let heightLeft = imgHeight;
              let position = 0;

              pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;

              while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
              }
            }

            const fileName = `orcamento-${orcamento.codigo || orcamentoId}.pdf`;
            pdf.save(fileName);
            toast.success("PDF gerado com sucesso!");
            resolve();
          } catch (error) {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(error);
          }
        };
        
        iframe.src = 'about:blank';
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8 text-muted-foreground">
            Carregando dados do orçamento...
          </div>
        </div>
      </div>
    );
  }

  if (error || !orcamento) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              {error || "Erro ao carregar dados do orçamento"}
            </p>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Visualizar/Imprimir Orçamento</h2>
          <div className="flex gap-2">
            <button
              onClick={handleGeneratePDF}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Baixar PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
            >
              Fechar
            </button>
          </div>
        </div>

        <div ref={contentRef} className="bg-white p-8" style={{ color: "#000", backgroundColor: "#ffffff" }} data-pdf-content>
          <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">ORÇAMENTO</h1>
            <p className="text-gray-600">Código: {orcamento.codigo}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Dados do Cliente</h2>
            <div className="space-y-1 text-gray-700">
              <p><strong>Nome:</strong> {orcamento.clientNome}</p>
              <p><strong>Local:</strong> {orcamento.locationNome}</p>
              <p><strong>Validade:</strong> {formatDate(orcamento.validade)}</p>
              <p><strong>Data de Emissão:</strong> {formatDate(orcamento.createdAt)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Itens do Orçamento</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Código</th>
                  <th className="border border-gray-300 p-2 text-left">Produto</th>
                  <th className="border border-gray-300 p-2 text-center">Quantidade</th>
                  <th className="border border-gray-300 p-2 text-right">Preço Unit.</th>
                  <th className="border border-gray-300 p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{item.productCod}</td>
                    <td className="border border-gray-300 p-2">{item.productNome}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {item.quantity} {item.undMedida}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatPrice(item.precoUnitario)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatPrice(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(orcamento.total)}
              </span>
            </div>
          </div>

          {orcamento.observacoes && (
            <div className="mt-6 p-4 bg-gray-50 border-l-4 border-blue-600">
              <h3 className="font-bold mb-2 text-gray-800">Observações</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{orcamento.observacoes}</p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
            <p>Este é um orçamento gerado automaticamente pelo sistema ERP.</p>
            <p>Validade: {formatDate(orcamento.validade)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
