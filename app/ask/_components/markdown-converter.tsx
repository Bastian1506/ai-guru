"use client"

import { useState } from "react"
import { fetchMarkdownAction } from "@/actions/rag/processing/fetch-markdown-action"

export default function MarkdownConverter(): JSX.Element {
  const [url, setUrl] = useState<string>("")
  const [markdown, setMarkdown] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleConvert = async () => {
    setError("")
    setMarkdown("")

    if (!url) {
      setError("Please enter a valid URL.")
      return
    }

    try {
      const result = await fetchMarkdownAction(url)
      if (result.isSuccess && result.data) {
        setMarkdown(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    }
  }

  return (
    <div className="rounded-md border p-4 shadow-md">
      <h2 className="mb-4 text-lg font-semibold">
        Convert Website to Markdown
      </h2>
      <input
        type="url"
        className="mb-4 w-full rounded-md border p-2"
        placeholder="Enter website URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        required
      />
      <button
        className="rounded-md bg-blue-600 px-4 py-2 text-white"
        onClick={handleConvert}
      >
        Convert to Markdown
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      {markdown && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Markdown Output</h3>
          <pre className="overflow-auto rounded-md border bg-gray-100 p-4">
            {markdown}
          </pre>
        </div>
      )}
    </div>
  )
}
