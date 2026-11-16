import { PageHeader } from "@/components/ui/page-header";

export default function NotesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader title="Notes" actions={[{ label: "Add Note", variant: "accent" }]} />
      <section className="rounded-lg border border-stone bg-white p-8">
        <p className="text-base text-ink/70">
          Notes workspace placeholder — layout and branding follow the Figma dashboard system.
        </p>
      </section>
    </div>
  );
}
