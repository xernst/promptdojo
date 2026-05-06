// Dojo CodeMirror theme — replaces oneDark.
// Mirrors the brand palette from app/globals.css @theme block.
// Spec: design-kit/audit-v3/05-ide-deep-dive.md §pick3.
//
// Token map:
//   keyword       → green-500 600w  (def, return, if, for…)
//   string        → ink-100 italic  (the words you type — content)
//   comment       → ink-500 italic  (annotation)
//   number/bool   → ink-200         (literals — secondary content)
//   function/class→ green-300       (callable / declared)
//   operator      → ink-400
//   variableName  → ink-300
//   propertyName  → ink-300
//   punctuation   → ink-400

import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const ink100 = "#f4f4f5";
const ink200 = "#e4e4e7";
const ink300 = "#d4d4d8";
const ink400 = "#a1a1aa";
const ink500 = "#8a8a93";
const ink700 = "#3f3f46";
const ink900 = "#18181b";
const ink950 = "#14140f";
const green300 = "#6ee7b7";
const green500 = "#2aa06a";

const dojoEditorTheme = EditorView.theme(
  {
    "&": { color: ink300, backgroundColor: ink950 },
    ".cm-content": { caretColor: green500 },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: green500,
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(42, 160, 106, 0.18)",
    },
    ".cm-activeLine": { backgroundColor: ink900 },
    ".cm-gutters": {
      backgroundColor: ink950,
      color: ink700,
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: ink900, color: ink400 },
    ".cm-lineNumbers": { color: ink700 },
  },
  { dark: true },
);

const dojoHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: green500, fontWeight: "600" },
  { tag: t.string, color: ink100, fontStyle: "italic" },
  { tag: t.comment, color: ink500, fontStyle: "italic" },
  { tag: [t.number, t.bool, t.null], color: ink200 },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: green300,
  },
  { tag: [t.standard(t.variableName), t.className], color: green300 },
  { tag: t.operator, color: ink400 },
  { tag: t.variableName, color: ink300 },
  { tag: t.propertyName, color: ink300 },
  { tag: t.punctuation, color: ink400 },
]);

export const dojoTheme = [
  dojoEditorTheme,
  syntaxHighlighting(dojoHighlightStyle),
];
