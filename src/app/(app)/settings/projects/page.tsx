import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { getProjects, createProject, archiveProject } from "@/actions/projects";
import { ProjectForm } from "./project-form";
import { ProjectCreateForm } from "./project-create-form";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => !p.is_archived);

  return (
    <>
      <TopBar title="Project" subtitle={`${active.length} project aktif`} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Lainnya
        </Link>

        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-sm font-bold text-foreground">Cara kerja Project</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Track transaksi per project usaha (mis. Klien A, Renovasi rumah).
            Project &quot;Umum&quot; jadi default buat transaksi non-project — gak bisa
            dihapus.
          </p>
        </div>

        <section>
          <h2 className="text-base md:text-lg font-extrabold tracking-tight inline-flex items-center gap-2 mb-3">
            <span aria-hidden className="block h-5 w-1 rounded-full bg-primary" />
            Project Aktif
          </h2>
          <ul className="space-y-2.5">
            {active.map((project) => (
              <li key={project.id}>
                <ProjectForm
                  project={project}
                  onArchive={async () => {
                    "use server";
                    return archiveProject(project.id);
                  }}
                />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base md:text-lg font-extrabold tracking-tight inline-flex items-center gap-2 mb-3">
            <span aria-hidden className="block h-5 w-1 rounded-full bg-primary" />
            Tambah Project
          </h2>
          <ProjectCreateForm action={createProject} />
        </section>
      </div>
    </>
  );
}
