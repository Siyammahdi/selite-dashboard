"use client";

import { useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { TextArea, TextInput } from "@/components/ui/form-fields";
import { PageHeader } from "@/components/ui/page-header";
import { addNote, deleteNote, toggleNotePin, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";

function formatNoteDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotesView() {
  const { notes } = useDashboard();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const sorted = [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
  );

  function createNote() {
    if (!title.trim()) {
      setError("Title is required");
      pushToast("Add a title first", "error");
      return;
    }
    addNote({
      id: `NOTE-${Date.now()}`,
      title: title.trim(),
      body: body.trim() || "No details yet.",
      createdAt: new Date().toISOString(),
      pinned: false,
    });
    setTitle("");
    setBody("");
    setError("");
    setOpen(false);
    pushToast("Note saved");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Notes"
        actions={[
          {
            label: "Add Note",
            variant: "accent",
            onClick: () => {
              setTitle("");
              setBody("");
              setError("");
              setOpen(true);
            },
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((note, index) => (
          <article
            key={note.id}
            className="animate-fade-up rounded-xl border border-stone bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="font-semibold text-ink">{note.title}</h2>
              {note.pinned ? (
                <span className="rounded bg-lime px-2 py-0.5 text-[10px] font-semibold">Pinned</span>
              ) : null}
            </div>
            <p className="mb-4 text-sm text-ink/70">{note.body}</p>
            <div className="flex items-center justify-between text-xs text-ink/50">
              <span>{formatNoteDate(note.createdAt)}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => {
                    toggleNotePin(note.id);
                    pushToast(note.pinned ? "Unpinned" : "Pinned", "info");
                  }}
                >
                  {note.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  className="text-flame underline-offset-2 hover:underline"
                  onClick={() => {
                    deleteNote(note.id);
                    pushToast("Note deleted", "info");
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Drawer
        open={open}
        title="Add Note"
        onClose={() => setOpen(false)}
        footer={<DrawerActions onSave={createNote} onCancel={() => setOpen(false)} saveLabel="Save note" />}
      >
        <div className="flex flex-col gap-2 pb-4">
          <TextInput label="Title" required value={title} onChange={setTitle} error={error} />
          <TextArea label="Details" rows={6} value={body} onChange={setBody} />
        </div>
      </Drawer>
    </div>
  );
}
