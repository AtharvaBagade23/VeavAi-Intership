import { NextRequest, NextResponse } from "next/server"

// Helper to extract only the JSON object from PHP comment
function extractJsonFromPhpComment(phpContent: string): any | null {
  const commentMatch = phpContent.match(/\/\*([\s\S]*?)\*\//)
  if (!commentMatch) return null
  // Clean up each line: remove leading * and whitespace
  const comment = commentMatch[1]
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, ''))
    .join('')
    .trim()
  // Find all {...} blocks
  const jsonBlocks = comment.match(/\{[\s\S]*\}/g)
  if (!jsonBlocks) return null
  let lastError = null
  for (const block of jsonBlocks) {
    try {
      return JSON.parse(block)
    } catch (err) {
      lastError = err
    }
  }
  // If all blocks fail, return error info
  return { _error: 'Failed to parse JSON', _lastError: lastError, _blocks: jsonBlocks, _comment: comment }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phpFileUrl = searchParams.get("phpFileUrl")
  if (!phpFileUrl) {
    return NextResponse.json({ error: "Missing phpFileUrl param" }, { status: 400 })
  }

  // Fetch the PHP file via HTTP from the public directory
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const fileUrl = `${baseUrl}${phpFileUrl}`
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error("Failed to fetch PHP file via HTTP")
    const phpContent = await res.text()
    console.log("[DEBUG] Fetched file content:\n", phpContent)
    const jsonTemplate = extractJsonFromPhpComment(phpContent)
    if (!jsonTemplate || jsonTemplate._error) {
      return NextResponse.json({ error: "No valid JSON template found in PHP file", debug: phpContent, extract: jsonTemplate }, { status: 400 })
    }
    return NextResponse.json({ template: jsonTemplate })
  } catch (err) {
    return NextResponse.json({ error: "Failed to read PHP file" }, { status: 500 })
  }
} 