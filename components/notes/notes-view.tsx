"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { TextArea, TextInput } from "@/components/ui/form-fields";
import { PageHeader } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import { Toggle } from "@/components/ui/toggle";
import {
  addNote,
  deleteNote,
  updateNote,
  useDashboard,
} from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { Note } from "@/lib/types";

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
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (notes.find((n) => n.id === selectedId) ?? null) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      : notes;
    return [...list].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
    );
  }, [notes, query]);

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Notes"
        actions={[
          {
            label: "Add Note",
            variant: "accent",
            onClick: () => {
              setSelectedId(null);
              setCreateOpen(true);
            },
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {notes.length} note{notes.length === 1 ? "" : "s"} · click a card to edit
        </p>
        <SearchField value={query} onChange={setQuery} placeholder="Search notes…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? "No notes match your search" : "No notes yet"}
          description={
            query
              ? "Try a different keyword, or clear the search."
              : "Capture restock reminders, courier issues, and ops todos."
          }
          action={
            query
              ? undefined
              : {
                  label: "Add Note",
                  onClick: () => setCreateOpen(true),
                }
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note, index) => (
            <article
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(note.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(note.id);
                }
              }}
              className="animate-fade-up cursor-pointer rounded-xl border border-stone bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-md"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-semibold text-ink">{note.title}</h2>
                {note.pinned ? (
                  <span className="rounded bg-lime px-2 py-0.5 text-[10px] font-semibold">Pinned</span>
                ) : null}
              </div>
              <p className="mb-4 line-clamp-3 text-sm text-ink/70">{note.body}</p>
              <div className="flex items-center justify-between text-xs text-ink/50">
                <span>{formatNoteDate(note.createdAt)}</span>
                <span className="text-forest">Open →</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <NoteDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <NoteDrawer
        open={!!selected}
        note={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function NoteDrawer({
  open,
  note,
  onClose,
}: {
  open: boolean;
  note?: Note | null;
  onClose: () => void;
}) {
  if (!open) return null;
  return <NoteDrawerForm key={note?.id ?? "create"} note={note} onClose={onClose} />;
}

function NoteDrawerForm({ note, onClose }: { note?: Note | null; onClose: () => void }) {
  const editing = Boolean(note);
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [error, setError] = useState("");

  function handleSave() {
    if (!title.trim()) {
      setError("Title is required");
      pushToast("Add a title first", "error");
      return;
    }

    if (editing && note) {
      updateNote(note.id, {
        title: title.trim(),
        body: body.trim() || "No details yet.",
        pinned,
      });
      pushToast("Note updated");
    } else {
      addNote({
        id: `NOTE-${Date.now()}`,
        title: title.trim(),
        body: body.trim() || "No details yet.",
        createdAt: new Date().toISOString(),
        pinned,
      });
      pushToast("Note saved");
    }
    onClose();
  }

  function handleDelete() {
    if (!note) return;
    if (!window.confirm(`Delete note “${note.title}”?`)) return;
    deleteNote(note.id);
    pushToast("Note deleted", "info");
    onClose();
  }

  return (
    <Drawer
      open
      title={editing ? "Edit Note" : "Add Note"}
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing ? handleDelete : undefined}
          saveLabel={editing ? "Save Change" : "Save note"}
          deleteLabel="Delete"
        />
      }
    >
      <div className="flex flex-col gap-3 pb-4">
        <TextInput label="Title" required value={title} onChange={setTitle} error={error} />
        <TextArea label="Details" rows={8} value={body} onChange={setBody} />
        <div className="flex items-center justify-between rounded-lg border border-stone px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-ink">Pin to top</p>
            <p className="text-xs text-ink/50">Pinned notes stay above the rest</p>
          </div>
          <Toggle checked={pinned} onChange={setPinned} label="Pin note" />
        </div>
      </div>
    </Drawer>
  );
}
