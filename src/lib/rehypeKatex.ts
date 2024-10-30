import type { Root, Text } from "hast"
import { fromMarkdown, type Options } from "mdast-util-from-markdown"
import { mathFromMarkdown } from "mdast-util-math"
import { math } from "micromark-extension-math"
import { types } from "micromark-util-symbol"
import rehypeKatexHtml from "rehype-katex"
import rehypeStringify from "rehype-stringify"
import remarkRehype from "remark-rehype"
import { unified, type Plugin, type Transformer } from "unified"
import { visitParents } from "unist-util-visit-parents"

const transformer = unified()
  .use(remarkRehype)
  .use(rehypeKatexHtml)
  .use(rehypeStringify)

const fromMarkdownSettings = {
  extensions: [
    {
      disable: { null: Object.values(types) },
    },
    math(),
  ],
  mdastExtensions: [mathFromMarkdown()],
} satisfies Options

type RootTree = {
  children: RootTree[]
}

export const rehypeKatex = (() => {
  return ((tree) => {
    visitParents(tree, "text", (text: Text, ancestor: Root[]) => {
      const root = fromMarkdown(text.value, fromMarkdownSettings)
      const htmlRoot = transformer.runSync(root)
      const parent = ancestor.at(-1)!
      const index = parent.children.indexOf(text)!
      parent.children[index] = htmlRoot.children[0]
    })
    return {
      type: "root",
      children: (tree as unknown as RootTree).children[0].children[1]
        .children[0].children,
    }
  }) satisfies Transformer
}) satisfies Plugin
