export interface TeamPreset {
  id: string
  label: string
  description: string
  /** GitHub org whose public members to load */
  org: string
}

/**
 * Built-in presets for Linux Foundation and related groups.
 * Each preset loads the public members of a GitHub organisation.
 * Add more entries here as new LF groups/teams join.
 */
export const TEAM_PRESETS: TeamPreset[] = [
  {
    id: 'cncf',
    label: 'CNCF Staff',
    description: 'Cloud Native Computing Foundation',
    org: 'cncf',
  },
  {
    id: 'aaif',
    label: 'AAIF Technical Committee',
    description: 'Agentic AI Foundation TC',
    org: 'aaif',
  },
]
