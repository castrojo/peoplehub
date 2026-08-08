// Types for the social hashtag feed (Mastodon + Bluesky posts tagged with the
// community hashtag, e.g. #awesomecncf).

export type SocialPlatform = 'mastodon' | 'bluesky'

export interface SocialPost {
  id: string
  platform: SocialPlatform
  /** Plain-text content (HTML stripped) */
  text: string
  url: string
  createdAt: string
  author: {
    name: string
    handle: string
    avatarUrl: string
    profileUrl: string
  }
  /** Which instance/server this came from, e.g. "hachyderm.io" or "bsky.app" */
  source: string
}

export interface SocialFeedState {
  posts: SocialPost[]
  isLoading: boolean
  failedSources: string[]
  fetchedAt: string | null
  error: string | null
}
