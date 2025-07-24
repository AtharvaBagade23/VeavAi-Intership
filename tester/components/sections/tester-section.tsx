"use client"

import { useState } from "react"
import { apiCategories } from "@/data/api-data"
import type { ApiData } from "@/types/api"
import React from "react"

function StaticSidebar({ selectedAPI, onSelectAPI }: { selectedAPI: ApiData | null, onSelectAPI: (api: ApiData) => void }) {
  return (
    <div className="w-80 border-r border-black/20 dark:border-white/20 overflow-y-auto dark:circuit-pattern rounded-lg">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Categories</h3>
        <div className="space-y-2">
          {Object.entries(apiCategories).map(([category, apis]) => (
            <div key={category} className="border border-black/20 dark:border-white/20 rounded-lg overflow-hidden mb-2">
              <div className="w-full flex items-center justify-between p-3 text-left bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white">
                {category}
              </div>
              <div className="border-t border-black/20 dark:border-white/20">
                {apis.map((api) => (
                  <button
                    key={api.name}
                    onClick={() => onSelectAPI(api)}
                    className={`w-full text-left p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors ${
                      selectedAPI?.name === api.name ? "bg-blue-100/50 dark:bg-blue-900/30" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{api.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{api.endpoint}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{api.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StaticTester({ api }: { api: ApiData | null }) {
  const [endpoint, setEndpoint] = useState("")
  const [method, setMethod] = useState("POST")
  const [headers, setHeaders] = useState(`{
  "Content-Type": "application/json"
}`)
  const [body, setBody] = useState('{}')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update form when API changes
  React.useEffect(() => {
    if (api) {
      setEndpoint(api.endpoint)
      setMethod(api.method)
      setHeaders(`{
  "Content-Type": "application/json"
}`)
      setBody('{}')
      setResponse(null)
      setError(null)
    }
  }, [api])

  const handleSend = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      // For now, just mock a response
      await new Promise((res) => setTimeout(res, 1000))
      setResponse({
        status: 200,
        data: {
          message: `Mock response for ${api?.name}`,
          received: {
            endpoint,
            method,
            headers: JSON.parse(headers),
            body: JSON.parse(body),
          },
        },
      })
    } catch (e) {
      setError("Failed to send request")
    }
    setLoading(false)
  }

  if (!api) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select an API to get started</h3>
          <p className="text-gray-500 dark:text-gray-400">Choose an API from the sidebar to begin testing</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{api.name}</h2>
      <div className="text-gray-600 dark:text-gray-300 mb-4">{api.description}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endpoint: {api.endpoint}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">Method: {api.method}</div>
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSend()
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Endpoint</label>
          <input
            className="w-full p-2 rounded border"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Method</label>
          <select
            className="w-full p-2 rounded border"
            value={method}
            onChange={e => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Headers (JSON)</label>
          <textarea
            className="w-full p-2 rounded border font-mono"
            rows={3}
            value={headers}
            onChange={e => setHeaders(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Body (JSON)</label>
          <textarea
            className="w-full p-2 rounded border font-mono"
            rows={5}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="veavai-gradient text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {response && (
        <div className="mt-8 p-4 rounded bg-gray-100 dark:bg-gray-900 border">
          <div className="font-bold mb-2">Response</div>
          <pre className="text-xs overflow-x-auto">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export function TesterSection() {
  const [selectedAPI, setSelectedAPI] = useState<ApiData | null>(null)
  return (
    <div className="flex h-[calc(100vh-4rem)] animate-in slide-in-from-left duration-500">
      <StaticSidebar selectedAPI={selectedAPI} onSelectAPI={setSelectedAPI} />
      <StaticTester api={selectedAPI} />
    </div>
  )
}
