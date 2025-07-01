"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, FileText, Upload } from "lucide-react"
import type { ApiData } from "@/types/api"
import { getApiTemplate } from "@/utils/template-generator"

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  selectedAPI: ApiData
  onApplyTemplate: (template: any) => void
  template?: any
}

export function TemplateModal({ isOpen, onClose, selectedAPI, onApplyTemplate, template: propTemplate }: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState("json")
  const [template, setTemplate] = useState<any>(propTemplate ?? getApiTemplate(selectedAPI).json)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (propTemplate) {
      setTemplate(propTemplate)
    }
  }, [propTemplate])

  const handleFileUpload = async (file: File) => {
    console.log("[DEBUG] handleFileUpload called with file:", file);
    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      console.log("[DEBUG] Sending POST to /api/template/upload");
      const res = await fetch("/api/template/upload", {
        method: "POST",
        body: formData,
      })
      console.log("[DEBUG] Got response from /api/template/upload", res);
      const data = await res.json()
      console.log("[DEBUG] Response JSON:", data);
      if (data.template) {
        setTemplate(data.template)
        setActiveTab("json")
      } else {
        setUploadError(data.error || "No template found in file")
      }
    } catch (err) {
      setUploadError("Failed to upload file")
      console.error("[DEBUG] Upload error:", err);
    }
    setUploading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            API Templates for {selectedAPI.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>JSON Input</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>File Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="mt-4">
            <Card className="veavai-glass">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">JSON Template</h3>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(template, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => onApplyTemplate(template)} className="veavai-gradient">
                      Apply Template
                    </Button>
                  </div>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(template, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file" className="mt-4">
            <Card className="veavai-glass">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">File Upload Template</h3>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(template, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => onApplyTemplate(template)} className="veavai-gradient">
                      Apply Template
                    </Button>
                  </div>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(template, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
