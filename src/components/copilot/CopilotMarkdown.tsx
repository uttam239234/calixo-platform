"use client";

/**
 * Calixo AI Copilot Workspace - lightweight Markdown renderer.
 *
 * No markdown dependency exists anywhere in this codebase yet, so this is
 * a small, self-contained block/inline parser covering exactly what the
 * Copilot chat needs: headings, bullet/numbered lists, fenced code blocks,
 * inline code, blockquotes, GFM-style pipe tables, links, bold, italic.
 * It renders real React elements (never dangerouslySetInnerHTML).
 */

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function isFence(line: string): boolean {
  return /^```/.test(line.trim());
}
function isHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line);
}
function isBlockquote(line: string): boolean {
  return /^>\s?/.test(line);
}
function isUnorderedItem(line: string): boolean {
  return /^\s*[-*+]\s+/.test(line);
}
function isOrderedItem(line: string): boolean {
  return /^\s*\d+[.)]\s+/.test(line);
}
function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("-")) return false;
  const cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|");
  return cells.length > 0 && cells.every(c => /^\s*:?-+:?\s*$/.test(c));
}
function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(c => c.trim());
}
function isBlockStart(lines: string[], i: number): boolean {
  const line = lines[i];
  if (line === undefined || line.trim() === "") return true;
  if (isFence(line) || isHeading(line) || isBlockquote(line) || isUnorderedItem(line) || isOrderedItem(line)) return true;
  if (line.includes("|") && lines[i + 1] !== undefined && isTableSeparatorRow(lines[i + 1])) return true;
  return false;
}

function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:|\/)/i.test(url);
}

const INLINE_TOKEN = /(`[^`]+`)|(\[[^\]]+\]\([^\s)]+\))|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(_[^_]+_)/g;

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let idx = 0;
  const regex = new RegExp(INLINE_TOKEN);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${idx}`;

    if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
      if (linkMatch && isSafeUrl(linkMatch[2])) {
        nodes.push(
          <a key={key} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
    idx++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const HEADING_CLASSES: Record<number, string> = {
  1: "text-h1",
  2: "text-h2",
  3: "text-h3",
  4: "text-h4",
  5: "text-body font-semibold",
  6: "text-caption font-semibold uppercase tracking-wide text-muted-foreground",
};

function Heading({ level, children }: { level: number; children: ReactNode }) {
  const className = cn("mt-3 mb-1.5 first:mt-0", HEADING_CLASSES[level] ?? HEADING_CLASSES[6]);
  switch (level) {
    case 1:
      return <h1 className={className}>{children}</h1>;
    case 2:
      return <h2 className={className}>{children}</h2>;
    case 3:
      return <h3 className={className}>{children}</h3>;
    case 4:
      return <h4 className={className}>{children}</h4>;
    case 5:
      return <h5 className={className}>{children}</h5>;
    default:
      return <h6 className={className}>{children}</h6>;
  }
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div className="my-2 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{lang || "code"}</span>
        <button type="button" onClick={handleCopy} className="text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}

function MarkdownTable({ header, rows }: { header: string[]; rows: string[][] }) {
  return (
    <div className="my-2 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr>
            {header.map((h, i) => (
              <th key={i} className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {parseInline(h, `th-${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 align-top">
                  {parseInline(cell, `td-${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (isFence(line)) {
      const lang = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !isFence(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(<CodeBlock key={key++} lang={lang} code={codeLines.join("\n")} />);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(
        <Heading key={key++} level={level}>
          {parseInline(headingMatch[2], `h-${key}`)}
        </Heading>
      );
      i++;
      continue;
    }

    if (isBlockquote(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && isBlockquote(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="border-l-2 border-primary/40 pl-3 text-muted-foreground italic">
          {parseInline(quoteLines.join(" "), `bq-${key}`)}
        </blockquote>
      );
      continue;
    }

    if (line.includes("|") && lines[i + 1] !== undefined && isTableSeparatorRow(lines[i + 1])) {
      const header = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push(<MarkdownTable key={key++} header={header} rows={rows} />);
      continue;
    }

    if (isUnorderedItem(line)) {
      const items: string[] = [];
      while (i < lines.length && isUnorderedItem(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-0.5 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item, `ul-${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (isOrderedItem(line)) {
      const items: string[] = [];
      const startMatch = line.match(/^\s*(\d+)[.)]\s+/);
      const start = startMatch ? parseInt(startMatch[1], 10) : 1;
      while (i < lines.length && isOrderedItem(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} start={start} className="list-decimal space-y-0.5 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{parseInline(item, `ol-${key}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && !isBlockStart(lines, i)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(<p key={key++}>{parseInline(paraLines.join(" "), `p-${key}`)}</p>);
    }
  }

  return blocks;
}

export function CopilotMarkdown({ content, className }: { content: string; className?: string }) {
  const blocks = useMemo(() => renderBlocks(content), [content]);
  return (
    <div className={cn("space-y-2 text-sm leading-relaxed text-foreground [&_a]:text-primary", className)}>{blocks}</div>
  );
}
