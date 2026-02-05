"use server";

import { actionClient } from "@/lib/next-safe-action";
import { resend } from "@/lib/resend";
import { db } from "@/db/index";
import {
  orcamentosTable,
  orcamentoItemsTable,
  clientsTable,
  locationsTable,
  productsTable,
  groupsTable,
  subgroupsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOrcamentoEmailSchema } from "./schema";

export const sendOrcamentoEmailAction = actionClient
  .schema(sendOrcamentoEmailSchema)
  .action(async ({ parsedInput }) => {
    const orcamento = await db
      .select({
        id: orcamentosTable.id,
        codigo: orcamentosTable.codigo,
        clientId: orcamentosTable.clientId,
        clientNome: clientsTable.nome,
        locationId: orcamentosTable.locationId,
        locationNome: locationsTable.nome,
        total: orcamentosTable.total,
        observacoes: orcamentosTable.observacoes,
        validade: orcamentosTable.validade,
        temNota: orcamentosTable.temNota,
        status: orcamentosTable.status,
        createdAt: orcamentosTable.createdAt,
        updatedAt: orcamentosTable.updatedAt,
      })
      .from(orcamentosTable)
      .innerJoin(clientsTable, eq(orcamentosTable.clientId, clientsTable.id))
      .innerJoin(locationsTable, eq(orcamentosTable.locationId, locationsTable.id))
      .where(eq(orcamentosTable.id, parsedInput.orcamentoId))
      .limit(1);

    if (orcamento.length === 0) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    const items = await db
      .select({
        id: orcamentoItemsTable.id,
        productId: productsTable.id,
        productCod: productsTable.cod,
        productNome: productsTable.nome,
        grupoCod: groupsTable.cod,
        subgrupoCod: subgroupsTable.cod,
        quantity: orcamentoItemsTable.quantity,
        undMedida: orcamentoItemsTable.undMedida,
        precoUnitario: orcamentoItemsTable.precoUnitario,
        subtotal: orcamentoItemsTable.subtotal,
      })
      .from(orcamentoItemsTable)
      .innerJoin(productsTable, eq(orcamentoItemsTable.productId, productsTable.id))
      .leftJoin(groupsTable, eq(productsTable.grupoId, groupsTable.id))
      .leftJoin(subgroupsTable, eq(productsTable.subgrupoId, subgroupsTable.id))
      .where(eq(orcamentoItemsTable.orcamentoId, parsedInput.orcamentoId));

    const orc = { ...orcamento[0], items };

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

    const itemsHtml = orc.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productCod}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productNome}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity} ${item.undMedida}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.precoUnitario)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.subtotal)}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb;">
          <div style="max-width: 800px; margin: 0 auto; padding: 20px; background-color: white;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0;">ORÇAMENTO</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Código: ${orc.codigo}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Dados do Cliente</h2>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${orc.clientNome}</p>
              <p style="margin: 5px 0;"><strong>Local:</strong> ${orc.locationNome}</p>
              <p style="margin: 5px 0;"><strong>Validade:</strong> ${formatDate(orc.validade)}</p>
              <p style="margin: 5px 0;"><strong>Data de Emissão:</strong> ${formatDate(orc.createdAt)}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Itens do Orçamento</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Código</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produto</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantidade</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Preço Unit.</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 20px; font-weight: bold; color: #1f2937;">Total:</span>
                <span style="font-size: 24px; font-weight: bold; color: #2563eb;">${formatPrice(orc.total)}</span>
              </div>
            </div>

            ${orc.observacoes ? `
            <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #2563eb;">
              <h3 style="color: #1f2937; font-size: 16px; margin-top: 0;">Observações</h3>
              <p style="color: #666; margin: 0; white-space: pre-wrap;">${orc.observacoes}</p>
            </div>
            ` : ""}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
              <p>Este é um orçamento gerado automaticamente pelo sistema ERP.</p>
              <p>Validade: ${formatDate(orc.validade)}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: parsedInput.email,
        subject: `Orçamento ${orc.codigo} - ${orc.clientNome}`,
        html: htmlContent,
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      return { success: false, error: "Erro ao enviar email" };
    }
  });
