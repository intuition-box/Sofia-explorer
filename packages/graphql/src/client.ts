import { API_URL_PROD } from './constants'

export interface ClientConfig {
  headers: HeadersInit
  apiUrl?: string
}

let globalConfig: { apiUrl?: string } = {
  apiUrl: API_URL_PROD,
}

export function configureClient(config: { apiUrl: string }) {
  globalConfig = { ...globalConfig, ...config }
}

export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit['headers'],
) {
  return async () => {
    if (!globalConfig.apiUrl) {
      throw new Error(
        'GraphQL API URL not configured. Call configureClient first.',
      )
    }

    const res = await fetch(globalConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(options as Record<string, string>),
      },
      body: JSON.stringify({ query, variables }),
    })

    const json = await res.json()

    if (json.errors && (!json.data || Object.keys(json.data).length === 0)) {
      const { message } = json.errors[0]
      throw new Error(message)
    }

    return json.data as TData
  }
}
