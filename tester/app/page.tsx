"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { AboutSection } from "@/components/sections/about-section"
import { TesterSection } from "@/components/sections/tester-section"
import { ContactSection } from "@/components/sections/contact-section"
import { HistorySection } from "@/components/sections/history-section"

export default function VeavAITester() {
  const [activeTab, setActiveTab] = useState("About")

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-cyan-950">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-16">
        {activeTab === "About" && <AboutSection />}
        {activeTab === "Tester" && <TesterSection />}
        {activeTab === "History" && <HistorySection />}
        {activeTab === "Contact" && <ContactSection />}
      </main>
    </div>
  )
}
