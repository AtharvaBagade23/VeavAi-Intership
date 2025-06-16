"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { ApiData } from "@/types/api"
import { apiCategories } from "@/data/api-data"

interface ApiSidebarProps {
  selectedAPI: ApiData | null
  onSelectAPI: (api: ApiData) => void
}

export function ApiSidebar({ selectedAPI, onSelectAPI }: ApiSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Medical"])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="w-80 veavai-glass border-r border-white/20 overflow-y-auto circuit-pattern rounded-lg">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Categories</h3>
        <div className="space-y-2">
          {Object.entries(apiCategories).map(([category, apis]) => (
            <div key={category} className="border border-white/20 rounded-lg veavai-glass overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/10 transition-colors rounded-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                {expandedCategories.includes(category) ? (
                  <ChevronDown className="h-4 w-4 text-blue-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                )}
              </button>
              {expandedCategories.includes(category) && (
                <div className="border-t border-white/20 animate-in slide-in-from-top duration-200">
                  {apis.map((api) => (
                    <button
                      key={api.name}
                      onClick={() => onSelectAPI(api)}
                      className={`w-full text-left p-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors ${
                        selectedAPI?.name === api.name ? "bg-blue-100/50 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{api.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{api.endpoint}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{api.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
