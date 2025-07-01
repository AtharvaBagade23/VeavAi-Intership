import type { ApiData } from "@/types/api"
import apiCategoriesData from "@/data/api-categories.json"

// Flag to control whether to use API endpoint or local JSON
const USE_API_ENDPOINT = false

export async function loadApiCategories(): Promise<Record<string, ApiData[]>> {
  try {
    if (USE_API_ENDPOINT) {
      // Fetch from API endpoint (useful when switching to database)
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } else {
      // Load from local JSON file
      return apiCategoriesData as Record<string, ApiData[]>
    }
  } catch (error) {
    console.error("Failed to load API categories:", error)
    return {}
  }
}

// For server-side usage (if needed)
export function loadApiCategoriesSync(): Record<string, ApiData[]> {
  try {
    return apiCategoriesData as Record<string, ApiData[]>
  } catch (error) {
    console.error("Failed to load API categories:", error)
    return {}
  }
} 