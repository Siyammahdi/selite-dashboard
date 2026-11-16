"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { addNote, deleteNote, toggleNotePin, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";

export function NotesView() {
  const { notes } = useDashboard();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));

  function createNote() {
    if (!title.trim()) {
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
    setOpen(false);
    pushToast("Note saved");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader title="Notes" actions={[{ label: "Add Note", variant: "accent", onClick: () => setOpen(true) }]} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((note, index) => (
          <article
            key={note.id}
            className="animate-fade-up rounded-xl border border-stone bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="font-semibold text-ink">{note.title}</h2>
              {note.pinned ? <span className="rounded bg-lime px-2 py-0.5 text-[10px] font-semibold">Pinned</span> : null}
            </div>
            <p className="mb-4 text-sm text-ink/70">{note.body}</p>
            <div className="flex items-center justify-between text-xs text-ink/50">
              <span>{new Date(note.createdAt).toLocaleString()}</span>
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

      <Modal open={open} title="Add Note" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <label className="block text-sm">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-stone px-3"
            />
          </label>
          <label className="block text-sm">
            Details
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-stone px-3 py-2"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-stone px-4 py-2 text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="rounded-md bg-flame px-4 py-2 text-sm text-snow" onClick={createNote}>
              Save note
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
