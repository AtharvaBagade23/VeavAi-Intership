import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { endpoint, method, headers, body, devMode, useFileUpload } = await req.json()

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
    let requestHeaders = { ...headers };

    if (!["GET", "HEAD"].includes(method)) {
      if (useFileUpload && body instanceof FormData) {
        // For file uploads, use FormData
        delete requestHeaders["Content-Type"]; // Remove Content-Type header for multipart/form-data
      }
    }

    let requestInit: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (!["GET", "HEAD"].includes(method)) {
      if (useFileUpload && body instanceof FormData) {
        requestInit.body = body;
      } else {
        requestInit.body = body;
      }
    }

    const response = await fetch(endpoint, requestInit)
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