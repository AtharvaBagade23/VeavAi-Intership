"use client"

import { Loader2, AlertCircle, GripVertical, Menu, X } from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from "react"
import { useApiEndpoints } from "@/hooks/use-api-endpoints"

interface ApiSidebarProps {
  selectedEndpoint: any
  onSelectEndpoint: (endpoint: any) => void
  onSetRequestTemplate: (template: any) => void
}

export function ApiSidebar({ selectedEndpoint, onSelectEndpoint }: ApiSidebarProps) {
  const [categories, setCategories] = useState<{ [key: string]: any[] }>({})
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(320) // Default width (80 * 4 = 320px)
  const [isResizing, setIsResizing] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  
  const { endpoints, loading, error } = useApiEndpoints()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  const minWidth = 250
  const maxWidth = 600

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api-endpoints.json")
        if (!res.ok) throw new Error("Failed to load API endpoints")
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        setCategories({})
      }
    }
    fetchCategories()
  }, [])

  // Load saved width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebar-width')
    if (savedWidth) {
      const width = parseInt(savedWidth)
      if (width >= minWidth && width <= maxWidth) {
        setSidebarWidth(width)
      }
    }
  }, [])

  // Save width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-width', sidebarWidth.toString())
  }, [sidebarWidth])

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileDrawerOpen])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResize = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = e.clientX
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth)
        }
      }
    },
    [isResizing, minWidth, maxWidth],
  )

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", resize)
      document.addEventListener("mouseup", stopResize)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", resize)
      document.removeEventListener("mouseup", stopResize)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", resize)
      document.removeEventListener("mouseup", stopResize)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, resize, stopResize])

  const handleApiSelect = (endpoint: any) => {
    console.log("Sidebar API selected:", endpoint)
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
    onSelectEndpoint({
      ...endpoint,
      endpoint: endpoint.endpoint.startsWith(BASE_URL)
        ? endpoint.endpoint
        : BASE_URL + endpoint.endpoint.replace(/^\//, "")
    })
    // Close mobile drawer after selection
    setIsMobileDrawerOpen(false)
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  const SidebarContent = () => (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Categories</h3>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileDrawerOpen(false)}
          className="md:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Display the base URL */}
      <div className="mb-4 text-xs text-blue-700 dark:text-blue-300 font-mono break-all flex-shrink-0">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border">
          <span className="font-semibold">Base URL:</span> {BASE_URL}
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading APIs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="ml-2 text-red-600 dark:text-red-400">Failed to load APIs</span>
          </div>
        ) : (
          <div className="space-y-2 pr-2">
            {Object.keys(categories).map((category) => (
              <div key={category}>
                <button
                  className={`w-full text-left p-3 border rounded-lg mb-2 flex items-center justify-between transition-colors ${
                    expandedCategory === category
                      ? "bg-blue-100/50 dark:bg-blue-900/30 border-blue-500"
                      : "border-black/20 dark:border-white/20 hover:bg-white/10 dark:hover:bg-white/10"
                  }`}
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                >
                  <span className="font-semibold truncate">{category}</span>
                  <span className="ml-2 flex-shrink-0">{expandedCategory === category ? "▾" : "▸"}</span>
                </button>
                {expandedCategory === category && (
                  <div className="pl-2 pb-2">
                    {categories[category].map((endpoint: any) => (
                      <button
                        key={endpoint.endpoint}
                        onClick={() => handleApiSelect(endpoint)}
                        className={`w-full text-left p-2 mb-1 rounded transition-colors border-2 border-blue-500/20 dark:border-blue-500/20 ${
                          selectedEndpoint?.endpoint === endpoint.endpoint
                            ? "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-white"
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="font-medium truncate">{endpoint.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{endpoint.endpoint}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 line-clamp-2">{endpoint.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button - Positioned to avoid overlap */}
      <button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="fixed top-24 left-4 z-50 md:hidden bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
        style={{ marginTop: '1rem' }} // Extra margin to avoid header overlap
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-black/20 dark:border-white/20 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Resizable Sidebar */}
      <div 
        ref={sidebarRef}
        className="hidden md:block border-r border-black/20 dark:border-white/20 dark:circuit-pattern rounded-lg relative bg-white dark:bg-gray-900 h-full"
        style={{ 
          width: `${sidebarWidth}px`,
          minWidth: `${minWidth}px`,
          maxWidth: `${maxWidth}px`
        }}
      >
        <SidebarContent />

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:w-2 transition-all duration-200 ${
            isResizing ? "bg-blue-500" : "bg-transparent hover:bg-blue-400/50"
          }`}
          onMouseDown={startResize}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-500 text-white p-1 rounded shadow-lg">
              <GripVertical className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Resize Indicator */}
        {isResizing && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono z-10">
            {sidebarWidth}px
          </div>
        )}
      </div>
    </>
  )
}