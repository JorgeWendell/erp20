"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { usersTable, jobUsersTable, verificationsTable } from "@/db/schema";
import { createUserSchema } from "./schema";
import { nanoid } from "nanoid";
import { sendInviteEmailAction } from "@/actions/send-invite-email";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const id = nanoid();
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(usersTable).values({
      id,
      name: parsedInput.name,
      email: parsedInput.email,
      emailVerified: false,
      isActive: parsedInput.isActive,
      createdAt: now,
      updatedAt: now,
    });

    const jobUserId = nanoid();
    await db.insert(jobUsersTable).values({
      id: jobUserId,
      userId: id,
      jobId: parsedInput.jobId,
    });

    const token = nanoid(32);
    const verificationId = nanoid();
    
    await db.insert(verificationsTable).values({
      id: verificationId,
      identifier: parsedInput.email,
      value: token,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    try {
      const emailResult = await sendInviteEmailAction({
        email: parsedInput.email,
        name: parsedInput.name,
        token,
      });

      if (!emailResult.success) {
        console.error("Erro ao enviar email de convite:", emailResult.error);
      }
    } catch (error) {
      console.error("Erro ao enviar email de convite:", error);
    }

    return { success: true, id };
  });
