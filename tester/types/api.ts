export interface ApiData {
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

export interface RequestHistory {
  id: string
  apiName: string
  endpoint: string
  method: string
  status: number
  responseTime: number
  timestamp: string
}
