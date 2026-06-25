import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { getProjects, createProject, archiveProject } from "@/actions/projects";
import { ProjectForm } from "./project-form";
import { ProjectCreateForm } from "./project-create-form";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => !p.is_archived);

  return (
    <>
      <TopBar title="Project" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <p className="text-sm text-muted-foreground">
          Track transaksi per project usaha. Project "Umum" adalah default untuk transaksi non-project.
        </p>

        <div className="space-y-2">
          {active.map((project) => (
            <ProjectForm
              key={project.id}
              project={project}
              onArchive={async () => {
                "use server";
                return archiveProject(project.id);
              }}
            />
          ))}
        </div>

        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer p-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg border border-dashed border-border">
            <Plus className="w-4 h-4" />
            Tambah Project
          </summary>
          <div className="mt-2">
            <ProjectCreateForm action={createProject} />
          </div>
        </details>
      </div>
    </>
  );
}
