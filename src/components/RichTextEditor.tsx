import { useEffect, useRef } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Undo, Redo } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

/** Lightweight rich text editor (headings, paragraphs, lists, bold, links) */
export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Sync external value into the editor only when it differs (avoids caret jumps)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt("Enter URL", "https://");
    if (url) exec("createLink", url);
  };

  const btn = "p-2 rounded hover:bg-muted text-foreground/80 transition";

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-surface px-2 py-1.5">
        <button type="button" onClick={() => exec("formatBlock", "<h2>")} className={btn} title="Heading"><Heading2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec("formatBlock", "<h3>")} className={btn} title="Subheading"><Heading3 className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec("formatBlock", "<p>")} className={`${btn} text-xs font-semibold px-2.5`} title="Paragraph">P</button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => exec("bold")} className={btn} title="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec("italic")} className={btn} title="Italic"><Italic className="h-4 w-4" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className={btn} title="Bullet list"><List className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec("insertOrderedList")} className={btn} title="Numbered list"><ListOrdered className="h-4 w-4" /></button>
        <button type="button" onClick={addLink} className={btn} title="Link"><LinkIcon className="h-4 w-4" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" onClick={() => exec("undo")} className={btn} title="Undo"><Undo className="h-4 w-4" /></button>
        <button type="button" onClick={() => exec("redo")} className={btn} title="Redo"><Redo className="h-4 w-4" /></button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder || "Write festival description..."}
        className="rte-content min-h-[180px] px-4 py-3 text-sm leading-relaxed focus:outline-none prose-festival"
      />
    </div>
  );
}
