interface CacheEntry<T> {
  data: T
  storedAt: string
  version: number
}

const CACHE_VERSION = 1
const inMemoryFallback = new Map<string, string>()

function storageAvailable(): boolean {
  try {
    const test = '__peoplehub_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

function rawGet(key: string): string | null {
  if (storageAvailable()) {
    return localStorage.getItem(key)
  }
  return inMemoryFallback.get(key) ?? null
}

function rawSet(key: string, value: string): void {
  if (storageAvailable()) {
    try {
      localStorage.setItem(key, value)
      return
    } catch {
      // QuotaExceededError — fall through to in-memory
    }
  }
  inMemoryFallback.set(key, value)
}

function rawRemove(key: string): void {
  if (storageAvailable()) {
    localStorage.removeItem(key)
  }
  inMemoryFallback.delete(key)
}

export function cacheGet<T>(key: string, ttlMs: number): { data: T; ageMs: number } | null {
  const raw = rawGet(key)
  if (!raw) return null

  let entry: CacheEntry<T>
  try {
    entry = JSON.parse(raw) as CacheEntry<T>
  } catch {
    rawRemove(key)
    return null
  }

  if (entry.version !== CACHE_VERSION) {
    rawRemove(key)
    return null
  }

  const storedAt = new Date(entry.storedAt).getTime()
  const ageMs = Date.now() - storedAt

  if (ageMs > ttlMs) {
    rawRemove(key)
    return null
  }

  return { data: entry.data, ageMs }
}

export function cacheSet<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    storedAt: new Date().toISOString(),
    version: CACHE_VERSION,
  }
  rawSet(key, JSON.stringify(entry))
}

export function cacheClear(key: string): void {
  rawRemove(key)
}

export function cacheClearAll(prefix: string): void {
  if (storageAvailable()) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    keys.forEach(k => localStorage.removeItem(k))
  }
  for (const key of inMemoryFallback.keys()) {
    if (key.startsWith(prefix)) inMemoryFallback.delete(key)
  }
}

export function feedCacheKey(username: string): string {
  return `peoplehub:feed:v1:${username}`
}

export function repoCacheKey(fullName: string): string {
  return `peoplehub:repo:v1:${fullName}`
}
