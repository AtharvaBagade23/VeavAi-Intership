"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ResponsePanelProps {
  response: any
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState("formatted")

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
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
          <TabsContent value="headers" className="mt-4">
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700">
              {JSON.stringify(response.headers, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
