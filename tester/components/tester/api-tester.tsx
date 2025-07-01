"use client"

import { useState, useEffect, useRef } from "react"
import { Code, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequestForm } from "./request-form"
import { ResponsePanel } from "./response-panel"
import { CodeSamples } from "./code-samples"
import { TemplateModal } from "./template-modal"
import type { ApiEndpoint } from "@/hooks/use-api-endpoints"

interface ApiTesterProps {
  selectedEndpoint: ApiEndpoint | null
  uploadedTemplate?: any
}

// Utility to build the API endpoint
function buildApiEndpoint(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  return `${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

export function ApiTester({ selectedEndpoint, uploadedTemplate }: ApiTesterProps) {
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [template, setTemplate] = useState<any>(null)
  const [requestData, setRequestData] = useState({
    endpoint: "",
    method: "POST",
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: "{}",
    authToken: "",
    useFileUpload: false,
    devMode: false,
  })
  const [templateLoading, setTemplateLoading] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // If uploadedTemplate or selectedEndpoint changes, reset the form
  useEffect(() => {
    if (selectedEndpoint) {
      setRequestData({
        endpoint: selectedEndpoint.endpoint,
        method: "POST",
        headers: '{\n  "Content-Type": "application/json"\n}',
        body: "{}",
        authToken: "",
        useFileUpload: false,
        devMode: false,
      })
      setResponse(null)
    }
    // If uploadedTemplate is present, set it as the template for the modal, but do not fill the request body
    if (uploadedTemplate) {
      setTemplate(uploadedTemplate)
    }
  }, [uploadedTemplate, selectedEndpoint])

  // Fetch template when endpoint changes (if not uploaded)
  useEffect(() => {
    if (!selectedEndpoint) return
    if (uploadedTemplate) return // Don't overwrite uploaded template
    setTemplateLoading(true)
    setTemplateError(null)
    fetch(`/api/template?phpFileUrl=${encodeURIComponent(selectedEndpoint.phpFileUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (data.template) {
          setTemplate(data.template)
        } else {
          setTemplate(null)
          setTemplateError(data.error || "No template found")
        }
      })
      .catch(() => setTemplateError("Failed to fetch template"))
      .finally(() => setTemplateLoading(false))
  }, [selectedEndpoint, uploadedTemplate])

  // Handle file upload for template suggestion
  const handleFileUpload = async (file: File) => {
    setTemplateLoading(true)
    setTemplateError(null)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/template/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    if (data.template) {
      setTemplate(data.template)
    } else {
      setTemplateError(data.error || "No template found in file")
    }
    setTemplateLoading(false)
  }

  const handleSendRequest = async () => {
    setIsLoading(true)
    setResponse(null)
    try {
      const apiUrl = buildApiEndpoint(requestData.endpoint)
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: apiUrl,
          method: requestData.method,
          headers: JSON.parse(requestData.headers || '{}'),
          body: requestData.body,
          devMode: requestData.devMode,
        }),
      })
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setResponse({ error: "Failed to send request" })
    }
    setIsLoading(false)
  }

  if (!selectedEndpoint) {
    console.log('[DEBUG] selectedEndpoint is null or undefined:', selectedEndpoint);
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
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEndpoint.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedEndpoint.endpoint}</p>
          </div>
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".php,.txt"
              style={{ display: "none" }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  console.log("File selected", e.target.files[0]);
                  alert("File selected: " + e.target.files[0].name);
                  handleFileUpload(e.target.files[0]);
                } else {
                  console.log("No file selected");
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
        {/* Suppress templateError if uploadedTemplate is present or endpoint is a full URL */}
        {templateLoading && <div className="text-blue-500">Loading template...</div>}
        {templateError && !uploadedTemplate && !/^https?:\/\//i.test(selectedEndpoint.endpoint) && (
          <div className="text-red-500">{templateError}</div>
        )}
        <RequestForm
          selectedAPI={{
            name: selectedEndpoint.name,
            endpoint: selectedEndpoint.endpoint,
            description: selectedEndpoint.endpoint,
            category: "Agent",
            method: requestData.method,
          }}
          requestData={requestData}
          setRequestData={setRequestData}
          onSendRequest={handleSendRequest}
          isLoading={isLoading}
          onShowTemplateModal={() => setShowTemplateModal(true)}
        />
        {response && <ResponsePanel response={response} />}
        <CodeSamples requestData={requestData} />
        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          selectedAPI={{
            name: selectedEndpoint.name,
            endpoint: selectedEndpoint.endpoint,
            description: selectedEndpoint.endpoint,
            category: "Agent",
            method: requestData.method,
          }}
          template={template}
          onApplyTemplate={template => {
            setRequestData(prev => ({
              ...prev,
              body: JSON.stringify(template, null, 2),
            }))
            setShowTemplateModal(false)
          }}
        />
      </div>
    </div>
  )
}
