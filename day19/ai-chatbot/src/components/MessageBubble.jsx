
import { useState } from "react";
import { Check, Copy, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ message, streaming = false }) {
  const [copied, setCopied] = useState(false);
  const assistant = message.role === "assistant";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access may not be available in every context.
    }
  }

  return (
    <article className="flex animate-[fadeIn_180ms_ease-out] gap-3 sm:gap-4">
      <div
        className={[
          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border",
          assistant
            ? "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/15 dark:text-violet-300"
            : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        ].join(" ")}
      >
        {assistant ? <Sparkles size={17} /> : <User size={17} />}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="mb-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
          {assistant ? "Lumina" : "You"}
        </div>

        {message.content ? (
          <div className="markdown-content space-y-3 break-words text-[13px] leading-7 text-zinc-700 dark:text-zinc-300 sm:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="mb-3 mt-6 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-5 text-lg font-bold text-zinc-950 dark:text-white">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-4 text-base font-bold text-zinc-950 dark:text-white">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-disc space-y-1 pl-6">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal space-y-1 pl-6">{children}</ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-violet-400 pl-4 italic text-zinc-500 dark:text-zinc-400">
                    {children}
                  </blockquote>
                ),
                a: ({ ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-600 underline decoration-violet-300 underline-offset-4 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
                  />
                ),
                pre: ({ children }) => (
                  <pre className="my-3 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100 p-4 text-xs leading-6 text-zinc-800 dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-200">
                    {children}
                  </pre>
                ),
                code: ({ className, children, ...props }) => (
                  <code
                    className={[
                      "font-mono text-[0.9em]",
                      className
                        ? ""
                        : "rounded-md bg-zinc-200/80 px-1.5 py-0.5 text-violet-700 dark:bg-zinc-700 dark:text-violet-200",
                    ].join(" ")}
                    {...props}
                  >
                    {children}
                  </code>
                ),
                table: ({ children }) => (
                  <table className="my-3 w-full border-collapse text-left text-xs">
                    {children}
                  </table>
                ),
                th: ({ children }) => (
                  <th className="bg-zinc-100 font-semibold dark:bg-zinc-800">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="bg-white dark:bg-zinc-900">{children}</td>
                ),
                hr: () => (
                  <hr className="my-5 border-zinc-200 dark:border-zinc-700" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex h-8 items-center gap-1.5">
            <span className="size-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-violet-500" />
          </div>
        )}

        {streaming && message.content && (
          <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-violet-500 align-middle" />
        )}

        {!streaming && message.content && (
          <button
            onClick={copyMessage}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[10px] font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </article>
  );
}
