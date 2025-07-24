"use client"

import { useState, useEffect, useRef } from "react"
import { Code, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequestForm } from "./request-form"
import { ResponsePanel } from "./response-panel"
import { CodeSamples } from "./code-samples"
import { TemplateModal } from "./template-modal"
import type { ApiEndpoint } from "@/hooks/use-api-endpoints"
import { v4 as uuidv4 } from 'uuid';

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
    if (!selectedEndpoint) return;
    setRequestData({
      endpoint: selectedEndpoint.endpoint,
      method: (selectedEndpoint as any).method || "POST",
      headers: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer TOKEN_PLACEHOLDER"\n}',
      body: "{}",
      authToken: "",
      useFileUpload: false,
      devMode: false,
    });
    setResponse(null);
    // Remote endpoint: fetch from extractor API
    if (/^https?:\/\//i.test(selectedEndpoint.endpoint)) {
      (async () => {
        try {
          const url = new URL(selectedEndpoint.endpoint);
          let relativePath = url.pathname.split('/').pop() || '';
          if (!relativePath.endsWith('.php')) {
            relativePath += '.php';
          }
          const apiUrl = `https://app.callxpress.net/DOM/ai_specialists/api_tester/extract_template_from_doc.php?path=${relativePath}&method=${(selectedEndpoint as any).method || 'POST'}`;
          console.log('[DEBUG] Extractor API URL:', apiUrl);
          const proxyUrl = `/api/proxy-extractor?url=${encodeURIComponent(apiUrl)}`;
          const res = await fetch(proxyUrl);
          const data = await res.json();
          const templateData = data.template ? data.template : data;
          console.log('[DEBUG] Extractor response data:', data);
          console.log('[DEBUG] Setting templateData:', templateData);
          setTemplate(templateData);
          // If a valid template is fetched, set it as the request body
          // if (templateData && typeof templateData === 'object' && Object.keys(templateData).length > 0) {
          //   setRequestData(prev => ({
          //     ...prev,
          //     body: JSON.stringify(templateData, null, 2),
          //   }));
          // }
        } catch (err) {
          console.error('[DEBUG] Error fetching template from extractor:', err);
          setTemplate(null);
        }
      })();
    } else {
      // Local endpoint: fetch from /api/template
      setTemplateLoading(true);
      setTemplateError(null);
      fetch(`/api/template?phpFileUrl=${encodeURIComponent(selectedEndpoint.endpoint)}`)
        .then(res => res.json())
        .then(data => {
          if (data.template) {
            setTemplate(data.template);
          } else {
            setTemplate(null);
            setTemplateError(data.error || "No template found");
          }
        })
        .catch(() => setTemplateError("Failed to fetch template"))
        .finally(() => setTemplateLoading(false));
    }
    if (uploadedTemplate) {
      setTemplate(uploadedTemplate);
    }
  }, [uploadedTemplate, selectedEndpoint]);

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

  const CALL_LIMIT = parseInt(process.env.NEXT_PUBLIC_CALL_LIMIT || "5", 10);
  const LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  const handleSendRequest = async () => {
    // Check call limit
    const now = Date.now();
    let callData = localStorage.getItem("veavai-call-limit");
    let callInfo = callData ? JSON.parse(callData) : { count: 0, start: now };
    if (now - callInfo.start > LIMIT_WINDOW_MS) {
      // Reset window
      callInfo = { count: 0, start: now };
    }
    if (callInfo.count >= CALL_LIMIT) {
      setResponse({ error: `API call limit reached (${CALL_LIMIT} per hour). Please try again later.` });
      return;
    }
    // Increment and save
    callInfo.count += 1;
    localStorage.setItem("veavai-call-limit", JSON.stringify(callInfo));
    setIsLoading(true)
    setResponse(null)
    const startTime = Date.now();
    try {
      const apiUrl = buildApiEndpoint(requestData.endpoint)
      // Replace TOKEN_PLACEHOLDER with the actual auth token (if present)
      let headersString = requestData.headers || '';
      if (headersString.includes('TOKEN_PLACEHOLDER')) {
        headersString = headersString.replace(/TOKEN_PLACEHOLDER/g, requestData.authToken || '');
      }
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headersString);
      } catch (e) {
        setResponse({ error: "Invalid JSON in headers." });
        setIsLoading(false);
        return;
      }
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: apiUrl,
          method: requestData.method,
          headers: parsedHeaders,
          body: requestData.body,
          devMode: requestData.devMode,
        }),
      })
      const data = await res.json()
      // Show remaining limit in the response panel
      const remaining = CALL_LIMIT - callInfo.count;
      setResponse({ ...data, callLimit: { remaining, total: CALL_LIMIT } });
      // Store history in localStorage
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const status = data.status || (res.status ? res.status : 0);
      const apiName = selectedEndpoint?.name || apiUrl;
      const historyItem = {
        id: uuidv4(),
        method: requestData.method,
        endpoint: apiUrl,
        status,
        apiName,
        timestamp: Date.now(),
        responseTime,
        response: data, // Store the full API response
      };
      try {
        const prev = localStorage.getItem("veavai-request-history");
        const arr = prev ? JSON.parse(prev) : [];
        arr.unshift(historyItem);
        localStorage.setItem("veavai-request-history", JSON.stringify(arr.slice(0, 100)));
      } catch {}
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
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
            <div className="text-lg text-blue-600 dark:text-blue-300 font-semibold">Waiting for API response...</div>
          </div>
        )}
        {!isLoading && response && (
          <>
            {response.callLimit && (
              <div className="mb-4 text-sm text-blue-700 dark:text-blue-300 font-semibold">
                Remaining API calls this hour: {response.callLimit.remaining} / {response.callLimit.total}
              </div>
            )}
            <ResponsePanel response={response} />
          </>
        )}
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
