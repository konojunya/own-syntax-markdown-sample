import unified, { Transformer } from "unified";
import visit from "unist-util-visit";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import html from "rehype-stringify";
import { Node, Element } from "hast-format";

const textArea = document.getElementById("textarea") as HTMLTextAreaElement;
const button = document.getElementById("button");
const wrapper = document.getElementById("markup");

const IS_OWN_SYNTAX = /^{{(.+)\s(.+),(.+)}}$/;

function visitor(node: Element): void {
  console.log({ node });
  if (node.tagName === "p" && node.children[0].type === "text") {
    const value = node.children[0].value as string;
    const match = value.match(IS_OWN_SYNTAX);
    if (match != null && match.length === 4) {
      const [_, buttonType, text, link] = match;
      node.tagName = "a";
      node.properties = {
        class: [buttonType.trim()],
        href: link.trim()
      };
      node.children = [
        {
          type: "text",
          value: text.trim()
        }
      ];
    }
  }
}

function transformer(tree: Node): Node {
  visit(tree, "element", visitor);

  return tree;
}

function attacher(): Transformer {
  return transformer;
}

function transform(md: string): string {
  const { contents } = unified()
    .use(markdown, { commonmark: true })
    .use(remark2rehype)
    .use(attacher)
    .use(rehypeFormat)
    .use(html)
    .processSync(md);

  return contents.toString().trim();
}

button.onclick = () => {
  const md = textArea.value;
  const markup = transform(md);
  console.log({ markup });
  wrapper.innerHTML = markup;
};
button.click();
