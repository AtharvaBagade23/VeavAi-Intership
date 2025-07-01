import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { endpoint, method, headers, body, devMode } = await req.json()

  if (devMode) {
    // Return a mock response
    return NextResponse.json({
      mock: true,
      message: "This is a mock response (development mode)",
      request: { endpoint, method, headers, body }
    })
  }

  // Forward the request to the actual PHP API endpoint
  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : body,
    })
    const contentType = response.headers.get("content-type") || ""
    let data
    if (contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    return NextResponse.json({
      mock: false,
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to proxy request" }, { status: 500 })
  }
} 