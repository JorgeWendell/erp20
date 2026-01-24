import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

import { SuporteForm } from "./components/suporte-form";

export default async function SuportePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const [user] = await db
    .select({
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  const userName = user.name || "Usuário";
  const userEmail = user.email ?? "";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suporte
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Abra um chamado para reportar problemas ou tirar dúvidas
          </p>
        </div>
        <SuporteForm userName={userName} userEmail={userEmail} />
      </div>
    </div>
  );
}
