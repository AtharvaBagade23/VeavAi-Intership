# API Categories System

This document explains the dynamic API categories system that allows loading API data from different sources.

## Overview

The API categories system has been refactored to be dynamic and configurable. It currently supports loading data from a JSON file, with the infrastructure in place to easily switch to database or API endpoints.

## File Structure

```
tester/
├── data/
│   ├── api-categories.json    # JSON file containing API data
│   └── api-data.ts           # Main export file (backward compatible)
├── utils/
│   └── api-loader.ts         # Utility functions for loading data
├── hooks/
│   └── use-api-categories.ts # React hook for async loading
├── app/api/categories/
│   └── route.ts              # API endpoint for serving data
└── docs/
    └── API_CATEGORIES.md     # This documentation
```

## Usage

### Basic Usage (Current Implementation)

The system currently loads data from the JSON file automatically:

```typescript
import { apiCategories } from "@/data/api-data"

// Use the data directly
console.log(apiCategories.Medical)
```

### Using the React Hook

For components that need loading states and error handling:

```typescript
import { useApiCategories } from "@/hooks/use-api-categories"

function MyComponent() {
  const { apiCategories, loading, error } = useApiCategories()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {Object.entries(apiCategories).map(([category, apis]) => (
        <div key={category}>
          <h2>{category}</h2>
          {apis.map(api => (
            <div key={api.name}>{api.name}</div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Using the Utility Functions

```typescript
import { loadApiCategories, loadApiCategoriesSync } from "@/utils/api-loader"

// Async loading
const categories = await loadApiCategories()

// Sync loading (for server-side)
const categories = loadApiCategoriesSync()
```

## Configuration

### Switching to API Endpoint

To switch from JSON file to API endpoint, modify `tester/utils/api-loader.ts`:

```typescript
// Change this flag to true
const USE_API_ENDPOINT = true
```

### Switching to Database

To switch to database, update the API route in `tester/app/api/categories/route.ts`:

```typescript
export async function GET() {
  try {
    // Replace this with your database query
    const categories = await db.apiCategories.findMany()
    
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch API categories" },
      { status: 500 }
    )
  }
}
```

## Data Structure

The API data follows this structure:

```typescript
interface ApiData {
  name: string
  endpoint: string
  description: string
  category: string
  method: string
  templates?: {
    json: any
    file: any
  }
}

type ApiCategories = Record<string, ApiData[]>
```

## Adding New APIs

To add new APIs, simply edit the `tester/data/api-categories.json` file:

```json
{
  "NewCategory": [
    {
      "name": "New API",
      "endpoint": "/api/new-category/new-api",
      "description": "Description of the new API",
      "category": "NewCategory",
      "method": "POST"
    }
  ]
}
```

## Benefits

1. **Dynamic Loading**: Data can be loaded from different sources
2. **Error Handling**: Proper loading states and error handling
3. **Backward Compatibility**: Existing code continues to work
4. **Easy Migration**: Simple flag to switch between data sources
5. **Type Safety**: Full TypeScript support
6. **Future-Proof**: Ready for database integration

## Migration Path

1. **Current**: JSON file loading
2. **Next**: API endpoint with JSON file as source
3. **Future**: Database integration with API endpoint 