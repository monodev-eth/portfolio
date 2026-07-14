import { Marked } from "marked";
import { codeToHtml } from "shiki";

/* Runs only at build time (every blog surface is force-static), so shiki's
 * grammar loading costs nothing at runtime. */
const THEME = "poimandres";

type HighlightedToken = { html?: string };

export async function renderMarkdown(markdown: string): Promise<string> {
  const marked = new Marked({ async: true, gfm: true });
  marked.use({
    walkTokens: async (token) => {
      if (token.type !== "code") return;
      const lang = (token.lang ?? "").trim().split(/\s+/)[0] || "text";
      try {
        (token as HighlightedToken).html = await codeToHtml(token.text, { lang, theme: THEME });
      } catch {
        // Unknown language: leave the token alone and let the default
        // renderer emit an escaped <pre><code> block.
      }
    },
    renderer: {
      code(token) {
        return (token as HighlightedToken).html ?? false;
      },
    },
  });
  return marked.parse(markdown);
}
