import type { ApiError, RateLimitConfig } from '@/types'

export type { RateLimitConfig }

// Cache simple en memoria para resultados de búsqueda
const responseCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Limpia entradas de cache expiradas
 */
function cleanExpiredCache(): void {
  const now = Date.now()
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key)
    }
  }
}

/**
 * Retry con backoff exponencial para rate limiting
 */
async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  config: RateLimitConfig,
  attempt: number = 0
): Promise<Response> {
  const response = await fetch(url, options)

  // Si es rate limit (429), reintentar con backoff
  if (response.status === 429 && attempt < config.maxRetries) {
    const delay = Math.min(
      config.initialDelay * Math.pow(2, attempt),
      config.maxDelay
    )

    // Wait for delay with jitter
    const jitter = Math.random() * 0.3 * delay
    await new Promise((resolve) => setTimeout(resolve, delay + jitter))

    return fetchWithBackoff(url, options, config, attempt + 1)
  }

  return response
}

/**
 * Fetch con retry automático y manejo de rate limiting
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  optionsWithRateLimit?: {
    rateLimit?: RateLimitConfig
    cache?: boolean
  }
): Promise<Response> {
  const rateLimitConfig: RateLimitConfig = optionsWithRateLimit?.rateLimit || {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  }

  const shouldCache = optionsWithRateLimit?.cache !== false && options.method === 'GET'

  // Check cache for GET requests
  if (shouldCache) {
    const cached = responseCache.get(url)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Return a mock response with cached data
      const cachedResponse = new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
      return cachedResponse
    }
  }

  const response = await fetchWithBackoff(url, options, rateLimitConfig)

  // Cache successful GET responses
  if (shouldCache && response.ok) {
    try {
      const data = await response.clone().json()
      responseCache.set(url, { data, timestamp: Date.now() })
      cleanExpiredCache()
    } catch {
      // Response no es JSON, no cachear
    }
  }

  return response
}

/**
 * Obtiene datos con cache
 */
export async function fetchCached<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  const response = await fetchWithRetry(url, options, { cache: true })

  if (!response.ok) {
    const error: ApiError = {
      message: `Request failed: ${response.status}`,
      status: response.status,
    }
    throw error
  }

  return response.json()
}

/**
 * Limpia todo el cache
 */
export function clearCache(): void {
  responseCache.clear()
}

/**
 * Obtiene tamaño actual del cache
 */
export function getCacheSize(): number {
  return responseCache.size
}