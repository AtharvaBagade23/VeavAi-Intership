"use client"

import { Send, Sparkles, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { ApiData } from "@/types/api"
import type { RequestData } from "@/types/request"
import { useEffect } from "react"

const BASE_URL = "https://app.callxpress.net/";

interface RequestFormProps {
  selectedAPI: ApiData
  requestData: RequestData
  setRequestData: React.Dispatch<React.SetStateAction<RequestData>>
  onSendRequest: () => void
  isLoading: boolean
  onShowTemplateModal: () => void
}

export function RequestForm({ selectedAPI, requestData, setRequestData, onSendRequest, isLoading, onShowTemplateModal }: RequestFormProps) {
  const updateRequestData = (field: keyof RequestData, value: string | boolean | File | null) => {
    setRequestData(prev => ({ ...prev, [field]: value }))
  }

  // Sync endpoint field only when selectedAPI.endpoint changes
  useEffect(() => {
    const BASE_URL = "https://app.callxpress.net/";
    // Always set the full URL in the endpoint field
    const fullEndpoint = selectedAPI.endpoint.startsWith(BASE_URL)
      ? selectedAPI.endpoint
      : selectedAPI.endpoint.replace(/^\//, "");
    if (requestData.endpoint !== fullEndpoint) {
      setRequestData(prev => ({
        ...prev,
        endpoint: fullEndpoint
      }));
    }
  }, [selectedAPI.endpoint]);

  return (
    <Card className="veavai-glass">
      <CardContent className="p-6 space-y-6">
        {/* API Info */}
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="secondary" className="capitalize">{selectedAPI.category}</Badge>
          <Badge variant="outline" className="uppercase">{selectedAPI.method}</Badge>
        </div>

        {/* Endpoint and Method */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input
              id="endpoint"
              value={requestData.endpoint}
              readOnly
              className="font-mono cursor-not-allowed"
            />
          </div>
          <div>
            <Label htmlFor="method">Method</Label>
            <Select value={requestData.method} onValueChange={(value) => updateRequestData("method", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Headers */}
        <div>
          <Label htmlFor="headers">Headers</Label>
          <Textarea
            id="headers"
            value={requestData.headers}
            onChange={(e) => updateRequestData("headers", e.target.value)}
            className="font-mono h-24"
            placeholder="JSON headers"
          />
        </div>

        {/* Request Body */}
        <div>
          <Label htmlFor="body">Request Body</Label>
          <Textarea
            id="body"
            value={requestData.body}
            onChange={(e) => updateRequestData("body", e.target.value)}
            className="font-mono h-32"
            placeholder="JSON request body"
          />
        </div>

        {/* Suggest Template Button */}
        <div className="flex justify-start">
          <Button
            onClick={onShowTemplateModal}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Suggest Template
          </Button>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fileUpload"
              checked={requestData.useFileUpload}
              onCheckedChange={(checked) => {
                updateRequestData("useFileUpload", checked);
                if (!checked) {
                  updateRequestData("file", null);
                }
              }}
            />
            <Label htmlFor="fileUpload">Use File Upload (multipart/form-data)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="devMode"
              checked={requestData.devMode}
              onCheckedChange={(checked) => updateRequestData("devMode", checked)}
            />
            <Label htmlFor="devMode">Enable Development Mode</Label>
          </div>
        </div>

        {/* File Upload Section */}
        {requestData.useFileUpload && (
          <div className="space-y-4 animate-in slide-in-from-top duration-300">
            <div>
              <Label htmlFor="file">File Upload</Label>
              <div className="mt-2">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        updateRequestData("file", file);
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="border border-input rounded-md px-3 py-2 bg-background flex items-center gap-2 text-sm text-muted-foreground hover:bg-accent/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{requestData.file ? requestData.file.name : "Choose a file..."}</span>
                    </div>
                  </div>
                  {requestData.file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateRequestData("file", null)}
                      className="px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {requestData.file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Size: {(requestData.file.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="additionalFields">Additional Fields (JSON format)</Label>
              <Textarea
                id="additionalFields"
                value={requestData.additionalFields || JSON.stringify({
                  customer_id: "",
                  category: "",
                  tone: "professional"
                }, null, 2)}
                onChange={(e) => updateRequestData("additionalFields", e.target.value)}
                className="font-mono h-32"
                placeholder={JSON.stringify({
                  customer_id: "your-id",
                  category: "your-category",
                  tone: "professional"
                }, null, 2)}
              />
            </div>
          </div>
        )}

        {/* Auth Token */}
        <div>
          <Label htmlFor="token">Auth Token</Label>
          <Input
            id="token"
            type="password"
            value={requestData.authToken}
            onChange={(e) => updateRequestData("authToken", e.target.value)}
            placeholder="Your authentication token"
          />
        </div>

        {/* Send Request Button */}
        <Button
          onClick={onSendRequest}
          disabled={isLoading}
          className="w-full veavai-gradient hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending Request...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Send Request</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
