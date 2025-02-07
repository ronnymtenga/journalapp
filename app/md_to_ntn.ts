import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Node, Parent } from 'unist';

export function convertMarkdownToNotionBlocks(markdown: string): any[] {
  const tree = unified().use(remarkParse).parse(markdown) as Node;
  const blocks: any[] = [];

  function isParent(node: Node): node is Parent {
    return 'children' in node;
  }

  function isTextNode(node: Node): node is { type: 'text'; value: string } {
    return node.type === 'text' && 'value' in node;
  }
  
  function isCodeNode(node: Node): node is { type: 'code'; value: string; lang?: string } {
    return node.type === 'code' && 'value' in node;
  }
  
  function isHeadingNode(node: Node): node is { type: 'heading'; depth: number } {
    return node.type === 'heading' && 'depth' in node;
  }

  function processNode(node: Node) {
    if (isHeadingNode(node)) {
      const text = isParent(node)
        ? node.children.map(child => (isTextNode(child) ? child.value : '')).join('')
        : '';
      const headingType = node.depth === 1 ? 'heading_1' : node.depth === 2 ? 'heading_2' : 'heading_3';
      blocks.push({
        object: 'block',
        type: headingType,
        [headingType]: {
          rich_text: [{ type: 'text', text: { content: text } }]
        }
      });
    } else if (isCodeNode(node)) {
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: node.value } }],
          language: node.lang || 'plaintext'
        }
      });
    } else if (node.type === 'paragraph') {
      const text = isParent(node)
        ? node.children.map(child => (isTextNode(child) ? child.value : '')).join('')
        : '';
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { 
          rich_text: [{ type: 'text', text: { content: text } }] 
        }
      });
    } else if (isParent(node)) {
      node.children.forEach(child => processNode(child));
    }
  }

  processNode(tree);
  return blocks;
}
