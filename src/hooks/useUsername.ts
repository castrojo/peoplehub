// Backward-compatible shim — username is now always "awesome-cncf" (collective feed).
// Real config (optional GitHub token) lives in useConfig.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useUsername() {
  return {
    username: 'awesome-cncf' as const,
    setUsername: (_: string) => {},
    clearUsername: () => {},
  }
}
