import { NextRequest, NextResponse } from "next/server"

// Helper to extract endpoint and JSON template from PHP comment
function extractEndpointAndJsonFromPhpComment(phpContent: string): { endpoint: string | null, template: any | null, debug?: any } {
  // Extract the main PHPDoc comment block
  const commentMatch = phpContent.match(/\/\*\*([\s\S]*?)\*\//);
  if (!commentMatch) return { endpoint: null, template: null };
  // Clean up each line: remove leading * and whitespace
  const lines = commentMatch[1]
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, ''));
  const comment = lines.join('\n').trim();

  // Extract endpoint from @api {post} ... line
  let endpoint: string | null = null;
  for (const line of lines) {
    const endpointMatch = line.match(/^@api\s+\{post\}\s+(\S+)/i);
    if (endpointMatch) {
      endpoint = endpointMatch[1];
      break;
    }
  }

  // Extract JSON request example after @apiParamExample {json} Request Example:
  let template: any = null;
  let lastError = null;
  const paramExampleIdx = lines.findIndex(line => line.includes('@apiParamExample {json} Request Example:'));
  if (paramExampleIdx !== -1) {
    // Find the block of lines that look like JSON (start with {, end with })
    let jsonLines: string[] = [];
    let started = false;
    for (let i = paramExampleIdx + 1; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l.startsWith('{')) started = true;
      if (started) jsonLines.push(l.replace(/^\*\s?/, ''));
      if (l.endsWith('}')) break;
    }
    const jsonStr = jsonLines.join('\n');
    try {
      template = JSON.parse(jsonStr);
    } catch (err) {
      lastError = err;
    }
  }

  if (!template) {
    return { endpoint, template: null, debug: { _error: 'Failed to parse JSON', _lastError: lastError, _comment: comment } };
  }
  return { endpoint, template };
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