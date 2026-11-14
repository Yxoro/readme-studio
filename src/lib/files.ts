const MAX_IMPORT_SIZE = 2 * 1024 * 1024;

export async function readMarkdownFile(file: File): Promise<string> {
  const hasMarkdownExtension = /\.(md|markdown|mdown|txt)$/i.test(file.name);
  const hasTextType = file.type === "text/markdown" || file.type === "text/plain";

  if (!hasMarkdownExtension && !hasTextType) {
    throw new Error("Please choose a Markdown (.md) file.");
  }

  if (file.size > MAX_IMPORT_SIZE) {
    throw new Error("That file is too large. Choose a Markdown file under 2 MB.");
  }

  try {
    const content = await file.text();
    if (content.trim().length === 0) {
      throw new Error("That Markdown file is empty.");
    }
    return content;
  } catch (error) {
    if (error instanceof Error && error.message.includes("empty")) throw error;
    throw new Error("Could not read that file. Please try again.");
  }
}

export function downloadMarkdown(content: string, filename = "README.md"): void {
  let objectUrl: string | null = null;
  try {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch {
    throw new Error("Could not export the file. Please try again.");
  } finally {
    const urlToRevoke = objectUrl;
    if (urlToRevoke) {
      window.setTimeout(() => URL.revokeObjectURL(urlToRevoke), 1000);
    }
  }
}

export async function copyText(content: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return;
    }
  } catch {
    // Fall through to the local copy fallback.
  }

  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const succeeded = document.execCommand("copy");
    if (!succeeded) throw new Error("Copy failed");
  } catch {
    throw new Error("Could not copy Markdown. Check your browser permissions.");
  } finally {
    textarea.remove();
  }
}
