"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { AboutSection } from "@/components/sections/about-section"
import { TesterSection } from "@/components/sections/tester-section"
import { ContactSection } from "@/components/sections/contact-section"
import { HistorySection } from "@/components/sections/history-section"
import { useIsMobile } from "@/components/ui/use-mobile"
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer"
import { Menu } from "lucide-react"
import { ApiSidebar } from "@/components/tester/api-sidebar"
import { ApiTester } from "@/components/tester/api-tester"
import type { ApiEndpoint } from "@/hooks/use-api-endpoints"

export default function VeavAITester() {
  const [activeTab, setActiveTab] = useState("About")
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [uploadedTemplate, setUploadedTemplate] = useState<any>(null)

  // Navigation tabs
  const tabs = ["About", "Tester", "History", "Contact"]

  // For mobile: close drawer after tab click
  function handleTabClick(tab: string) {
    setActiveTab(tab)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-cyan-950">
      {isMobile ? (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 veavai-glass border-b border-white/20">
            <div className="flex items-center space-x-3">
              <img src="/images/veavai-logo.png" alt="VeavAI Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">VeavAI API Tester</span>
            </div>
            <DrawerTrigger asChild>
              <button className="p-2 rounded-md bg-white/80 dark:bg-slate-800/80 shadow-md md:hidden">
                <Menu className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
                <span className="sr-only">Open navigation</span>
              </button>
            </DrawerTrigger>
          </div>
          <DrawerContent className="p-0 pt-16">
            <nav className="flex flex-col gap-2 p-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
                    activeTab === tab
                      ? "veavai-gradient text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </DrawerContent>
        </Drawer>
      ) : (
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      <main className="pt-16">
        {activeTab === "About" && <AboutSection />}
        {activeTab === "Tester" && (
          <div className="flex h-[calc(100vh-4rem)] animate-in slide-in-from-right duration-500">
            <ApiSidebar
              selectedEndpoint={selectedEndpoint}
              onSelectEndpoint={setSelectedEndpoint}
              onSetRequestTemplate={setUploadedTemplate}
            />
            <ApiTester selectedEndpoint={selectedEndpoint} uploadedTemplate={uploadedTemplate} />
          </div>
        )}
        {activeTab === "History" && <HistorySection />}
        {activeTab === "Contact" && <ContactSection />}
      </main>
    </div>
  )
}