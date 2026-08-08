// Fetches community posts tagged with our hashtag from the major social
// platforms our community actually uses that expose a public, unauthenticated
// read API with permissive CORS: Mastodon (federated instances) and Bluesky.
//
// X/Twitter and LinkedIn do not offer a way to search hashtags without paid
// API access / OAuth from a static, serverless client, so they are not
// included here. If that changes, add a fetcher below and merge its results
// into fetchSocialFeed().

import type { SocialPost } from '../types/social'

const FETCH_TIMEOUT_MS = 10_000

// The community hashtag from #26. Mastodon hashtags cannot contain hyphens,
// so "#awesome-cncf" normalizes to "awesomecncf" there; we search that form
// on every network for consistency.
export const SOCIAL_HASHTAG = 'awesomecncf'

// Well-known, high-traffic instances popular with the cloud native / CNCF
// community. Mastodon's tag timeline only reflects posts known to that
// instance, so we query a handful and merge results.
const MASTODON_INSTANCES = ['hachyderm.io', 'fosstodon.org', 'mastodon.social']

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
  } finally {
    clearTimeout(timer)
  }
}

function stripHtml(html: string): string {
  const withBreaks = html.replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n')
  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (div) {
    div.innerHTML = withBreaks
    return (div.textContent ?? '').trim()
  }
  // Fallback for non-DOM environments (e.g. tests run under Node)
  return withBreaks.replace(/<[^>]*>/g, '').trim()
}

interface MastodonStatus {
  id: string
  url: string
  content: string
  created_at: string
  account: {
    display_name: string
    username: string
    acct: string
    avatar: string
    url: string
  }
}

async function fetchMastodonTag(instance: string, tag: string): Promise<SocialPost[]> {
  const url = `https://${instance}/api/v1/timelines/tag/${encodeURIComponent(tag)}?limit=20`
  const response = await fetchWithTimeout(url)
  if (!response.ok) {
    throw new Error(`Mastodon ${instance} responded ${response.status}`)
  }
  const statuses = (await response.json()) as MastodonStatus[]

  return statuses.map((status) => ({
    id: `mastodon:${instance}:${status.id}`,
    platform: 'mastodon' as const,
    text: stripHtml(status.content),
    url: status.url,
    createdAt: status.created_at,
    author: {
      name: status.account.display_name || status.account.username,
      handle: `@${status.account.acct}`,
      avatarUrl: status.account.avatar,
      profileUrl: status.account.url,
    },
    source: instance,
  }))
}

interface BlueskyPost {
  uri: string
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
  record: {
    text: string
    createdAt: string
  }
}

function bskyPostUrl(uri: string, handle: string): string {
  // at://did:plc:xxx/app.bsky.feed.post/<rkey>
  const rkey = uri.split('/').pop() ?? ''
  return `https://bsky.app/profile/${handle}/post/${rkey}`
}

async function fetchBlueskyTag(tag: string): Promise<SocialPost[]> {
  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent('#' + tag)}&limit=25`
  const response = await fetchWithTimeout(url)
  if (!response.ok) {
    throw new Error(`Bluesky search responded ${response.status}`)
  }
  const data = (await response.json()) as { posts?: BlueskyPost[] }
  const posts = data.posts ?? []

  return posts.map((post) => ({
    id: `bluesky:${post.uri}`,
    platform: 'bluesky' as const,
    text: post.record.text,
    url: bskyPostUrl(post.uri, post.author.handle),
    createdAt: post.record.createdAt,
    author: {
      name: post.author.displayName || post.author.handle,
      handle: `@${post.author.handle}`,
      avatarUrl: post.author.avatar ?? '',
      profileUrl: `https://bsky.app/profile/${post.author.handle}`,
    },
    source: 'bsky.app',
  }))
}

export interface SocialFeedResult {
  posts: SocialPost[]
  failedSources: string[]
  fetchedAt: string
}

export async function fetchSocialFeed(tag: string = SOCIAL_HASHTAG): Promise<SocialFeedResult> {
  const sources: Array<{ name: string; run: () => Promise<SocialPost[]> }> = [
    ...MASTODON_INSTANCES.map((instance) => ({
      name: instance,
      run: () => fetchMastodonTag(instance, tag),
    })),
    { name: 'bsky.app', run: () => fetchBlueskyTag(tag) },
  ]

  const results = await Promise.allSettled(sources.map((s) => s.run()))

  const posts: SocialPost[] = []
  const failedSources: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      posts.push(...result.value)
    } else {
      failedSources.push(sources[i].name)
    }
  })

  // Dedupe (same post can surface from multiple instances via federation)
  // by normalized author handle + text, keep the earliest-seen copy.
  const seen = new Set<string>()
  const deduped: SocialPost[] = []
  for (const post of posts) {
    const key = `${post.platform}:${post.author.handle}:${post.text}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(post)
  }

  deduped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    posts: deduped,
    failedSources,
    fetchedAt: new Date().toISOString(),
  }
}
