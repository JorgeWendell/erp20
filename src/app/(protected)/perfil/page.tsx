import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { usersTable, jobUsersTable, jobTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail } from "lucide-react";

export default async function PerfilPage() {
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
      jobNome: jobTable.nome,
    })
    .from(usersTable)
    .leftJoin(jobUsersTable, eq(usersTable.id, jobUsersTable.userId))
    .leftJoin(jobTable, eq(jobUsersTable.jobId, jobTable.id))
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Meu Perfil
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Visualize suas informações e altere sua senha
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="mb-6 flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl bg-blue-600 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            {user.jobNome && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.jobNome}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                E-mail
              </p>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <KeyRound className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Senha
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  Alterar sua senha de acesso
                </p>
              </div>
            </div>
            <Link href="/forgot-password">
              <Button variant="outline" className="gap-2">
                <KeyRound className="h-4 w-4" />
                Alterar senha
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
