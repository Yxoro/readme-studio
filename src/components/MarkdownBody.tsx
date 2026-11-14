import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

const components: Components = {
  a({ node: _node, ...props }) {
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
  img({ node: _node, ...props }) {
    return <img {...props} loading="lazy" />;
  },
  table({ node: _node, ...props }) {
    return (
      <div className="md-table-wrap">
        <table {...props} />
      </div>
    );
  },
};

interface MarkdownBodyProps {
  markdown: string;
  variant?: "preview" | "editor";
  className?: string;
}

export function MarkdownBody({
  markdown,
  variant = "preview",
  className = "",
}: MarkdownBodyProps) {
  return (
    <div
      className={`markdown-body ${
        variant === "editor" ? "markdown-body--editor" : ""
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeHighlight,
            { plainText: ["text", "txt", "http", "plaintext", "none", "no-highlight"] },
          ],
        ]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
