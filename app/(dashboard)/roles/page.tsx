import { PageHeader } from "@/components/ui/page-header";

export default function RolesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader title="Roles & Permission" actions={[{ label: "Add Role" }]} />
      <section className="rounded-lg border border-stone bg-white p-8">
        <p className="text-base text-ink/70">
          Role and permission management screens from the Figma set can be wired next. Navigation and
          shell match the dashboard design.
        </p>
      </section>
    </div>
  );
}
