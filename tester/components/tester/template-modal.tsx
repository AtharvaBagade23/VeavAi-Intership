"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, FileText, Upload, Sparkles } from "lucide-react"
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Remove local template state and use propTemplate directly

  useEffect(() => {
    if (isOpen && /^https?:\/\//i.test(selectedAPI.endpoint) && !propTemplate) {
      handleSuggestTemplate();
    }
    // Only run when modal opens or endpoint changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedAPI.endpoint, propTemplate]);

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/template/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.template) {
        // Use onApplyTemplate to update parent
        onApplyTemplate(data.template)
        setActiveTab("json")
      } else {
        setUploadError(data.error || "No template found in file")
      }
    } catch (err) {
      setUploadError("Failed to upload file")
    }
    setUploading(false)
  }

  const handleSuggestTemplate = async () => {
    if (/^https?:\/\//i.test(selectedAPI.endpoint)) {
      try {
        const url = new URL(selectedAPI.endpoint);
        let relativePath = url.pathname.split('/').pop() || '';
        if (!relativePath.endsWith('.php')) {
          relativePath += '.php';
        }
        const apiUrl = `https://app.callxpress.net/DOM/ai_specialists/api_tester/extract_template_from_doc.php?path=${relativePath}&method=${selectedAPI.method}`;
        setUploading(true);
        setUploadError(null);
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (res.ok && Object.keys(data).length > 0) {
          onApplyTemplate(data.template ? data.template : data);
          setActiveTab('json');
        } else {
          setUploadError('No request template found for this endpoint and method.');
        }
      } catch (e: any) {
        setUploadError('Error fetching template: ' + (e.message || e));
      }
      setUploading(false);
      return;
    }
    fileInputRef.current?.click();
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
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(propTemplate, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => onApplyTemplate(propTemplate)} className="veavai-gradient">
                      Apply Template
                    </Button>
                  </div>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(propTemplate, null, 2)}
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
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(propTemplate, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => onApplyTemplate(propTemplate)} className="veavai-gradient">
                      Apply Template
                    </Button>
                  </div>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(propTemplate, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
