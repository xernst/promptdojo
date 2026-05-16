"use client";
// One-keypress tangent inbox. ADHD rule #6 — capture intrusive thoughts and
// keep going. Stored in localStorage; can be exported to Obsidian later.

import { useEffect, useRef, useState } from "react";
import { Brain, X } from "lucide-react";
import { loadProgress, updateProgress } from "@/lib/storage";

export default function BrainDump() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<string[]>(() => loadProgress().brainDump);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus management: on open land focus in the textarea so the user can
  // start typing immediately; on close return focus to the trigger so
  // keyboard nav doesn't get stranded.
  useEffect(() => {
    if (open) {
      textareaRef.current?.focus();
    } else if (document.activeElement === document.body) {
      triggerRef.current?.focus();
    }
  }, [open]);

  function add() {
    const text = draft.trim();
    if (!text) return;
    const stamped = `[${new Date().toISOString().slice(0, 16).replace("T", " ")}] ${text}`;
    updateProgress((p) => ({ ...p, brainDump: [stamped, ...p.brainDump] }));
    setItems((cur) => [stamped, ...cur]);
    setDraft("");
  }

  function exportToFile() {
    const md = `# brain dump from promptdojo\n\n${items.map((i) => `- ${i}`).join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptdojo-braindump-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        title="brain dump (⌘⇧B)"
        aria-expanded={open}
        aria-controls="braindump-dialog"
        className="fixed bottom-4 right-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-800 bg-ink-900 text-ink-300 shadow-lg hover:bg-ink-800 hover:text-ink-200 transition md:h-auto md:w-auto md:gap-1.5 md:px-3 md:py-2 md:text-xs"
      >
        <Brain size={14} />
        <span className="hidden md:inline">park a thought</span>
      </button>
      {open && (
        <div
          id="braindump-dialog"
          role="dialog"
          aria-modal="false"
          aria-labelledby="braindump-title"
          className="fixed bottom-16 right-4 z-30 w-80 rounded-lg border border-ink-800 bg-ink-950 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-ink-800 px-3 py-2">
            <div
              id="braindump-title"
              className="flex items-center gap-1.5 text-xs font-medium text-ink-300"
            >
              <Brain size={12} aria-hidden="true" /> brain dump
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="close brain dump"
              className="text-ink-400 hover:text-ink-200"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <label htmlFor="braindump-textarea" className="sr-only">
            park a thought
          </label>
          <textarea
            ref={textareaRef}
            id="braindump-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="park a thought, then get back to the lesson. ⌘↵ to save."
            className="w-full resize-none bg-transparent px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 outline-none"
            rows={3}
          />
          <div className="border-t border-ink-800 px-3 py-2 flex gap-2">
            <button onClick={add} className="flex-1 rounded bg-green-600 px-2 py-1 text-xs font-medium text-ink-100 hover:bg-green-500">
              save
            </button>
            <button onClick={exportToFile} className="rounded border border-ink-700 px-2 py-1 text-xs text-ink-300 hover:bg-ink-800">
              export .md
            </button>
          </div>
          {items.length > 0 && (
            <div className="max-h-48 overflow-auto border-t border-ink-800 px-3 py-2 text-xs text-ink-400">
              {items.slice(0, 8).map((it) => (
                <div key={it} className="py-0.5 truncate" title={it}>
                  {it}
                </div>
              ))}
              {items.length > 8 && <div className="text-ink-600 mt-1">+ {items.length - 8} more</div>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
