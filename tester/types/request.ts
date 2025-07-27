export interface RequestData {
  endpoint: string
  method: string
  headers: string
  body: string
  useFileUpload: boolean
  devMode: boolean
  authToken: string
  file: File | null
  additionalFields: string
}
