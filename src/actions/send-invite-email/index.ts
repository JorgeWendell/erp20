"use server";

import { resend } from "@/lib/resend";
import { sendInviteEmailSchema } from "./schema";

export const sendInviteEmailAction = async (data: {
  email: string;
  name: string;
  token: string;
}) => {
  const parsed = sendInviteEmailSchema.parse(data);
  
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const signupUrl = `${baseURL}/signup?token=${parsed.token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: parsed.email,
      subject: "Convite para criar sua conta",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Bem-vindo, ${parsed.name}!</h2>
              <p>Você foi convidado para criar sua conta no sistema ERP.</p>
              <p>Clique no botão abaixo para definir sua senha e finalizar o cadastro:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${signupUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Criar Senha
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${signupUrl}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">Este link expira em 7 dias.</p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error: "Erro ao enviar email" };
  }
};
