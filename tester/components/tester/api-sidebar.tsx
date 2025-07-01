"use client"

import { Loader2, AlertCircle, Upload } from "lucide-react"
import { useApiEndpoints, ApiEndpoint } from "@/hooks/use-api-endpoints"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

interface ApiSidebarProps {
  selectedEndpoint: ApiEndpoint | null
  onSelectEndpoint: (endpoint: ApiEndpoint) => void
  onSetRequestTemplate: (template: any) => void
}

export function ApiSidebar({ selectedEndpoint, onSelectEndpoint, onSetRequestTemplate }: ApiSidebarProps) {
  const { endpoints, loading, error } = useApiEndpoints()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/template/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.endpoint && data.template) {
        console.log('[DEBUG] Calling onSelectEndpoint with:', { name: data.endpoint, endpoint: data.endpoint, phpFileUrl: "(uploaded)" });
        onSelectEndpoint({ name: data.endpoint, endpoint: data.endpoint, phpFileUrl: "(uploaded)" })
        onSetRequestTemplate(data.template)
      } else {
        alert(data.error || "No valid endpoint/template found in file")
      }
    } catch (err) {
      alert("Failed to upload file")
    }
  }

  return (
    <div className="w-80 border-r border-black/20 dark:border-white/20 overflow-y-auto dark:circuit-pattern rounded-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Agents</h3>
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".php,.txt"
              style={{ display: "none" }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0])
                }
              }}
            />
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload PHP File
            </Button>
          </>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading APIs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="ml-2 text-red-600 dark:text-red-400">Failed to load APIs</span>
          </div>
        ) : (
          <div className="space-y-2">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.endpoint}
                onClick={() => onSelectEndpoint(endpoint)}
                className={`w-full text-left p-3 border rounded-lg mb-2 transition-colors ${
                  selectedEndpoint?.endpoint === endpoint.endpoint
                    ? "bg-blue-100/50 dark:bg-blue-900/30 border-blue-500"
                    : "border-black/20 dark:border-white/20 hover:bg-white/10 dark:hover:bg-white/10"
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">{endpoint.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{endpoint.endpoint}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
