import type { Link, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const CITE_RE = /\[(\d+)\]/g;

/**
 * Turn RAG bracket refs like [1] into markdown links `#cite-1` so the UI can render them as buttons.
 */
export function remarkCitationRefLinks() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index: number | undefined, parent) => {
      if (parent == null || index === undefined) return;
      if (parent.type === "link") return;

      const value = node.value;
      if (!CITE_RE.test(value)) return;
      CITE_RE.lastIndex = 0;

      const segments: PhrasingContent[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = CITE_RE.exec(value)) !== null) {
        const before = value.slice(last, m.index);
        if (before) segments.push({ type: "text", value: before } satisfies Text);
        const n = m[1]!;
        const link: Link = {
          type: "link",
          url: `#cite-${n}`,
          children: [{ type: "text", value: m[0] }],
        };
        segments.push(link);
        last = m.index + m[0].length;
      }
      const rest = value.slice(last);
      if (rest) segments.push({ type: "text", value: rest } satisfies Text);

      if (segments.length === 1 && segments[0]!.type === "text") return;

      parent.children.splice(index, 1, ...segments);
      return index + segments.length;
    });
  };
}
