import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client'
import { convertMarkdownToNotionBlocks } from '../../md_to_ntn'; // Ensure this path is correct

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_API_KEY });

export async function POST(request: Request) {
  try {
    const { message } = await request.json(); // Extract the markdown text
    console.log("Received message:", message);

    // Convert Markdown into Notion blocks
    const blocks = convertMarkdownToNotionBlocks(message.text);

    const page_id = process.env.NEXT_PUBLIC_NOTION_PAGE_ID;
    if (!page_id) throw new Error("Page ID is missing from environment variables.");

    console.log("Appending to Notion page...");

    // Make a request to append blocks to the existing page
    const notionResponse = await notion.blocks.children.append({
      block_id: page_id, // Ensure this is a PAGE, not a block
      children: blocks // Append blocks directly to the page
    });
    

    console.log("Notion API response:", notionResponse);

    return NextResponse.json({ success: true, result: notionResponse });
  } catch (error) {
    console.error("Error exporting to Notion:", error);
    return NextResponse.json({ success: false, error: "Failed to export to Notion" }, { status: 500 });
  }
}
