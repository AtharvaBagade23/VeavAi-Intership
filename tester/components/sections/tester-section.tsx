"use client"

import { useState } from "react"
import { ApiSidebar } from "@/components/tester/api-sidebar"
import { ApiTester } from "@/components/tester/api-tester"
import type { ApiData } from "@/types/api"

export function TesterSection() {
  const [selectedAPI, setSelectedAPI] = useState<ApiData | null>(null)

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-in slide-in-from-right duration-500">
      <ApiSidebar selectedAPI={selectedAPI} onSelectAPI={setSelectedAPI} />
      <ApiTester selectedAPI={selectedAPI} />
    </div>
  )
}
