"use client"

import { useState } from "react"
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
}

export function TemplateModal({ isOpen, onClose, selectedAPI, onApplyTemplate }: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState("json")

  const templates = getApiTemplate(selectedAPI)

  const handleApplyTemplate = (template: any) => {
    onApplyTemplate(template)
    onClose()
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
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(templates.json, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => handleApplyTemplate(templates.json)} className="veavai-gradient">
                      Apply Template
                    </Button>
                  </div>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(templates.json, null, 2)}
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
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(templates.file, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => handleApplyTemplate(templates.file)} className="veavai-gradient">
                      Apply Template
                    </Button>
                  </div>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {JSON.stringify(templates.file, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
