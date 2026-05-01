// GitHub API types for peoplehub

export interface GitHubActor {
  login: string
  avatar_url: string
  url: string
}

export interface GitHubRepo {
  id: number
  name: string // owner/repo
  url: string  // api url
}

export interface WatchEvent {
  id: string
  type: 'WatchEvent'
  actor: GitHubActor
  repo: GitHubRepo
  payload: { action: 'started' }
  created_at: string
}

export interface ForkEvent {
  id: string
  type: 'ForkEvent'
  actor: GitHubActor
  repo: GitHubRepo
  payload: {
    forkee: {
      full_name: string
      html_url: string
    }
  }
  created_at: string
}

export type GitHubEvent = WatchEvent | ForkEvent | { id: string; type: string; actor: GitHubActor; repo: GitHubRepo; payload: unknown; created_at: string }

export interface RepoMetadata {
  fullName: string
  description: string | null
  language: string | null
  stargazersCount: number
  htmlUrl: string
}

export interface FeedItem {
  id: string
  type: 'star' | 'fork'
  repo: {
    fullName: string
    apiUrl: string
    htmlUrl: string
  }
  actors: Array<{
    login: string
    avatarUrl: string
    profileUrl: string
  }>
  count: number
  latestAt: string
}

export interface FeedResult {
  items: FeedItem[]
  isPartial: boolean
  fetchedAt: string
}

export type ApiError = 
  | { error: 'rate_limited'; retryAfter: number }
  | { error: 'not_found' }
  | { error: 'network'; message: string }
  | { error: 'unknown'; message: string }

export type ApiResult<T> = { data: T } | ApiError

export interface CollectiveFeedState {
  items: FeedItem[]
  isLoading: boolean
  isPartial: boolean
  failedUsers: string[]
  fetchedAt: string | null
  error: string | null
}

export type CategoryFilter = string | null  // null = all categories
