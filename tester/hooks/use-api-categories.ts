import { useState, useEffect } from "react"
import type { ApiData } from "@/types/api"
import { loadApiCategories } from "@/utils/api-loader"

export function useApiCategories() {
  const [apiCategories, setApiCategories] = useState<Record<string, ApiData[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApiCategories() {
      try {
        setLoading(true)
        setError(null)
        const categories = await loadApiCategories()
        setApiCategories(categories)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load API categories")
        console.error("Error loading API categories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchApiCategories()
  }, [])

  return { apiCategories, loading, error }
} 