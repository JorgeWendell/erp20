import { GroupForm } from "./components/group-form";
import { GroupsTable } from "./components/groups-table";
import { SubgroupForm } from "./components/subgroup-form";
import { SubgroupsTable } from "./components/subgroups-table";

export default function GruposSubgruposPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Seção de Grupos */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Grupos
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie os grupos do sistema
            </p>
          </div>
          <GroupForm />
        </div>
        <GroupsTable />
      </div>

      {/* Seção de Subgrupos */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subgrupos
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie os subgrupos do sistema
            </p>
          </div>
          <SubgroupForm />
        </div>
        <SubgroupsTable />
      </div>
    </div>
  );
}
