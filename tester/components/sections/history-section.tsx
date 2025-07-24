"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { RequestHistory } from "@/types/api"

export function HistorySection() {
  const [history, setHistory] = useState<RequestHistory[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("veavai-request-history")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem("veavai-request-history")
    setHistory([])
  }

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("veavai-request-history", JSON.stringify(updatedHistory))
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 400 && status < 500) return "bg-yellow-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in slide-in-from-top duration-500">
      <Card className="veavai-glass border-0 shadow-2xl shadow-blue-500/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Request History
            </CardTitle>
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Your API request history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="veavai-glass">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {item.method}
                        </Badge>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                        <span className="font-medium">{item.status}</span>
                        <span className="text-sm text-gray-500">{item.apiName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-mono">{item.endpoint}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Response time: {item.responseTime}ms</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        aria-expanded={expandedId === item.id}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Details
                        {expandedId === item.id ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedId === item.id && (
                      <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto text-sm font-mono">
                        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(item.response, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
