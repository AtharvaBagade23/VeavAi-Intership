"use client"

import { useState } from "react"
import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateCodeSample } from "@/utils/code-generator"

interface CodeSamplesProps {
  requestData: any
}

export function CodeSamples({ requestData }: CodeSamplesProps) {
  const [activeTab, setActiveTab] = useState("curl")

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const languages = [
    { id: "curl", name: "cURL" },
    { id: "python", name: "Python" },
    { id: "javascript", name: "JavaScript" },
    { id: "nodejs", name: "Node.js" },
    { id: "php", name: "PHP" },
  ]

  return (
    <Card className="veavai-glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Code Samples</span>
          <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-900/20">
            <Download className="h-4 w-4 mr-2" />
            Download Postman Collection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {languages.map((lang) => (
              <TabsTrigger key={lang.id} value={lang.id}>
                {lang.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {languages.map((lang) => (
            <TabsContent key={lang.id} value={lang.id} className="mt-4">
              <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                  {generateCodeSample(lang.id, requestData)}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateCodeSample(lang.id, requestData))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
