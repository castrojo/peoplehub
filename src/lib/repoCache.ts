import { cacheGet, cacheSet, repoCacheKey } from './cache'
import { getRepoMetadata } from './github'
import type { RepoMetadata } from '../types/github'

const REPO_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function getOrFetch(fullName: string): Promise<RepoMetadata | null> {
  const cached = cacheGet<RepoMetadata>(repoCacheKey(fullName), REPO_TTL_MS)
  if (cached) return cached.data

  const result = await getRepoMetadata(fullName)
  if ('error' in result) return null

  cacheSet(repoCacheKey(fullName), result.data)
  return result.data
}

export async function batchGetOrFetch(
  fullNames: string[]
): Promise<Map<string, RepoMetadata>> {
  const unique = [...new Set(fullNames)]
  const results = await Promise.all(
    unique.map(async name => {
      const meta = await getOrFetch(name)
      return [name, meta] as const
    })
  )
  const map = new Map<string, RepoMetadata>()
  for (const [name, meta] of results) {
    if (meta) map.set(name, meta)
  }
  return map
}
