"use client"

import { useState } from "react"
import { Code, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ApiData } from "@/types/api"
import { RequestForm } from "./request-form"
import { ResponsePanel } from "./response-panel"
import { CodeSamples } from "./code-samples"
import { TemplateModal } from "./template-modal"

interface ApiTesterProps {
  selectedAPI: ApiData | null
}

export function ApiTester({ selectedAPI }: ApiTesterProps) {
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [requestData, setRequestData] = useState({
    endpoint: "",
    method: "POST",
    headers: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer YOUR_TOKEN"\n}',
    body: '{\n  "message": "Hello, AI!",\n  "temperature": 0.7\n}',
    authToken: "",
    useFileUpload: false,
    devMode: false,
  })

  const handleSendRequest = async () => {
    setIsLoading(true)

    // Save to history
    const historyItem = {
      id: Date.now().toString(),
      apiName: selectedAPI?.name || "Unknown",
      endpoint: requestData.endpoint,
      method: requestData.method,
      status: 200,
      responseTime: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date().toISOString(),
    }

    const existingHistory = JSON.parse(localStorage.getItem("veavai-request-history") || "[]")
    const updatedHistory = [historyItem, ...existingHistory].slice(0, 50) // Keep last 50 requests
    localStorage.setItem("veavai-request-history", JSON.stringify(updatedHistory))

    // Simulate API call
    setTimeout(() => {
      setResponse({
        status: 200,
        data: {
          success: true,
          message: "API response received successfully",
          data: {
            ai_response: `Hello! I'm ${selectedAPI?.name || "AI Assistant"} and I'm ready to assist you.`,
            model: selectedAPI?.name || "AI Assistant",
            timestamp: new Date().toISOString(),
            specialist_type: selectedAPI?.category || "General",
          },
        },
        headers: {
          "content-type": "application/json",
          "x-response-time": `${historyItem.responseTime}ms`,
          "x-specialist": selectedAPI?.name || "Unknown",
        },
      })
      setIsLoading(false)
    }, 2000)
  }

  if (!selectedAPI) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select an API to get started</h3>
          <p className="text-gray-500 dark:text-gray-400">Choose an API from the sidebar to begin testing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAPI.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedAPI.description}</p>
          </div>
          <Button
            onClick={() => setShowTemplateModal(true)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Suggest Template
          </Button>
        </div>

        <RequestForm
          selectedAPI={selectedAPI}
          requestData={requestData}
          setRequestData={setRequestData}
          onSendRequest={handleSendRequest}
          isLoading={isLoading}
        />

        {response && <ResponsePanel response={response} />}

        <CodeSamples requestData={requestData} />

        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          selectedAPI={selectedAPI}
          onApplyTemplate={(template) => {
            setRequestData((prev) => ({
              ...prev,
              body: JSON.stringify(template, null, 2),
            }))
          }}
        />
      </div>
    </div>
  )
}
