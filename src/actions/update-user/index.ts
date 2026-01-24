"use server";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db/index";
import { usersTable, jobUsersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { updateUserSchema } from "./schema";
import { nanoid } from "nanoid";

export const updateUserAction = actionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    await db
      .update(usersTable)
      .set({
        name: parsedInput.name,
        email: parsedInput.email,
        isActive: parsedInput.isActive,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, parsedInput.id));

    const existingJobUser = await db
      .select()
      .from(jobUsersTable)
      .where(eq(jobUsersTable.userId, parsedInput.id))
      .limit(1);

    if (existingJobUser.length > 0) {
      await db
        .update(jobUsersTable)
        .set({
          jobId: parsedInput.jobId,
        })
        .where(eq(jobUsersTable.id, existingJobUser[0].id));
    } else {
      const jobUserId = nanoid();
      await db.insert(jobUsersTable).values({
        id: jobUserId,
        userId: parsedInput.id,
        jobId: parsedInput.jobId,
      });
    }

    return { success: true };
  });
