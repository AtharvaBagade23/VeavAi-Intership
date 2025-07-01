import { NextResponse } from "next/server"
import type { ApiData } from "@/types/api"
import apiCategoriesData from "@/data/api-categories.json"

export async function GET() {
  try {
    // In the future, this could be replaced with a database query
    // const categories = await db.apiCategories.findMany()
    
    const categories = apiCategoriesData as Record<string, ApiData[]>
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching API categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch API categories" },
      { status: 500 }
    )
  }
} 