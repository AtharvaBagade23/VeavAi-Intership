import { useEffect, useState } from "react"

export interface ApiEndpoint {
  name: string
  endpoint: string
  phpFileUrl: string
}

export function useApiEndpoints() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api-endpoints.json")
        if (!res.ok) throw new Error("Failed to load API endpoints")
        const data = await res.json()
        setEndpoints(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchEndpoints()
  }, [])

  return { endpoints, loading, error }
} 