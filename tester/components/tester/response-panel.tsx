"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ResponsePanelProps {
  response: any
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState("raw")

  return (
    <Card className="veavai-glass animate-in slide-in-from-bottom duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Response</span>
          <Badge variant={response.status === 200 ? "default" : "destructive"} className="veavai-gradient">
            {response.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="raw">Raw</TabsTrigger>
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
          </TabsList>
          <TabsContent value="formatted" className="mt-4">
            
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            
          </TabsContent>
          <TabsContent value="raw" className="mt-4">
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
              {JSON.stringify(response, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>

        {/* Parsed Output Section */}
        {response.data?.generated_html && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Parsed Output</h2>
            <div
              className="prose prose-h2:text-3xl prose-h2:font-extrabold prose-h3:text-2xl prose-h3:font-bold prose-p:text-base prose-p:leading-relaxed prose-ul:pl-6 prose-li:marker:text-gray-500 dark:prose-invert bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              dangerouslySetInnerHTML={{ __html: response.data.generated_html }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
