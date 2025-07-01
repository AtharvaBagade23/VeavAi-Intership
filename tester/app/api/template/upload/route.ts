import { NextRequest, NextResponse } from "next/server"

// Helper to extract endpoint and JSON template from PHP comment
function extractEndpointAndJsonFromPhpComment(phpContent: string): { endpoint: string | null, template: any | null, debug?: any } {
  const commentMatch = phpContent.match(/\/\*([\s\S]*?)\*\//)
  if (!commentMatch) return { endpoint: null, template: null }
  // Clean up each line: remove leading * and whitespace
  const lines = commentMatch[1]
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, ''))
  const comment = lines.join('\n').trim()
  // Extract endpoint
  let endpoint: string | null = null
  for (const line of lines) {
    const endpointMatch = line.match(/^Endpoint:\s*(\S+)/i)
    if (endpointMatch) {
      endpoint = endpointMatch[1]
      break
    }
  }
  // Find all {...} blocks (non-greedy)
  const jsonBlocks = comment.match(/\{[\s\S]*?\}/g)
  let template = null
  let lastError = null
  if (jsonBlocks) {
    for (const block of jsonBlocks) {
      try {
        template = JSON.parse(block)
        break
      } catch (err) {
        lastError = err
      }
    }
  }
  if (!template) {
    return { endpoint, template: null, debug: { _error: 'Failed to parse JSON', _lastError: lastError, _blocks: jsonBlocks, _comment: comment } }
  }
  return { endpoint, template }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const phpContent = buffer.toString("utf-8")
  const { endpoint, template, debug } = extractEndpointAndJsonFromPhpComment(phpContent)
  if (!template) {
    return NextResponse.json({ error: "No valid JSON template found in PHP file", debug: phpContent, extract: debug }, { status: 400 })
  }
  return NextResponse.json({ endpoint, template })
} 