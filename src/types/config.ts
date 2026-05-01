// Configuration types for awesome-cncf

export interface AppConfig {
  token?: string // GitHub personal access token (no scope needed for rate limit increase)
}

export const CONFIG_KEY = 'awesome-cncf:config:v1'
