"use server";

import { ActionState } from "@/types";

export async function fetchMarkdownAction(
  url: string
): Promise<ActionState<string>> {
  try {
    // Fetch the webpage content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch the webpage. Status: ${response.status}`);
    }

    const htmlContent = await response.text();

    // Send HTML to the Markdown API
    const markdownResponse = await fetch("https://web2md.answer.ai/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/plain",
      },
      body: `cts=${encodeURIComponent(htmlContent)}`,
    });

    if (!markdownResponse.ok) {
      throw new Error(
        `Failed to convert to Markdown. Status: ${markdownResponse.status}`
      );
    }

    const markdown = await markdownResponse.text();
    return {
      isSuccess: true,
      message: "Successfully converted to Markdown",
      data: markdown,
    };
  } catch (error) {
    console.error("Error in fetchMarkdownAction:", error);
    return {
      isSuccess: false,
      message: `Error: ${(error as Error).message}`,
    };
  }
}
