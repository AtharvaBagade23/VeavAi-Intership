import type { ApiData } from "@/types/api"
import { loadApiCategoriesSync } from "@/utils/api-loader"

// Load API categories dynamically from JSON
export const apiCategories: Record<string, ApiData[]> = loadApiCategoriesSync()

// Export the loader function for components that need async loading
export { loadApiCategories } from "@/utils/api-loader"
