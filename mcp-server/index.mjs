#!/usr/bin/env node
/**
 * peoplehub MCP server
 *
 * Exposes the peoplehub "who starred/forked what" feed as MCP tools so an
 * agent (e.g. goose, Claude, Copilot CLI) can answer questions like:
 *
 *   "jean-luc at work told me about a cool project about memory,
 *    but I don't remember it, find it for me"
 *
 * by searching recent star/fork activity from your configured team for a
 * repo matching "memory", optionally narrowed to a particular person.
 *
 * Config (env vars):
 *   PEOPLEHUB_TEAM   Comma-separated list of GitHub usernames to track.
 *                     Defaults to the same CNCF seed users the web app uses.
 *   GITHUB_TOKEN / GH_TOKEN   Optional token to raise GitHub API rate limits.
 *   PEOPLEHUB_PAGES_PER_USER  Optional, defaults to 1 (100 most recent events/user).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { fetchTeamFeed, getRepoMetadata } from './lib/github.mjs'
import { DEFAULT_TEAM } from './lib/default-team.mjs'

function getTeam() {
  const configured = (process.env.PEOPLEHUB_TEAM || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return configured.length > 0 ? configured : DEFAULT_TEAM
}

const PAGES_PER_USER = Number(process.env.PEOPLEHUB_PAGES_PER_USER || 1)

function matchesQuery(text, query) {
  if (!text) return false
  return text.toLowerCase().includes(query.toLowerCase())
}

function matchesPerson(actors, person) {
  if (!person) return true
  const needle = person.toLowerCase()
  return actors.some(login => login.toLowerCase().includes(needle))
}

/**
 * Core search: fetch the team feed, filter by optional person, then rank
 * repos by whether the query matches the repo name (cheap) or — for the
 * top candidates — its GitHub description/topics (requires an extra
 * API call per repo, so only done for a bounded number of candidates).
 */
async function findProject({ query, person, days = 90, limit = 5 }) {
  const team = getTeam()
  const items = await fetchTeamFeed(team, { pagesPerUser: PAGES_PER_USER })

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffIso = cutoff.toISOString()

  const inWindow = items.filter(item => item.latestAt >= cutoffIso && matchesPerson(item.actors, person))

  // Fast path: query matches the repo name directly.
  const nameMatches = inWindow.filter(item => matchesQuery(item.repo.fullName, query))

  // Slow path: fetch descriptions for remaining candidates (bounded) and
  // match against description/topics/language too.
  const remaining = inWindow.filter(item => !nameMatches.includes(item))
  const CANDIDATE_CAP = 40
  const enriched = []
  for (const item of remaining.slice(0, CANDIDATE_CAP)) {
    const meta = await getRepoMetadata(item.repo.fullName)
    const haystack = [meta?.description, ...(meta?.topics || []), meta?.language].filter(Boolean).join(' ')
    if (matchesQuery(haystack, query)) {
      enriched.push({ ...item, description: meta?.description ?? null })
    }
  }

  const results = [...nameMatches, ...enriched]
    .sort((a, b) => b.latestAt.localeCompare(a.latestAt))
    .slice(0, limit)

  // Attach descriptions for name-matched items too (best effort, cached).
  for (const r of results) {
    if (r.description === undefined) {
      const meta = await getRepoMetadata(r.repo.fullName)
      r.description = meta?.description ?? null
    }
  }

  return { team, results }
}

async function listTeamActivity({ person, days = 7, limit = 20 }) {
  const team = getTeam()
  const items = await fetchTeamFeed(team, { pagesPerUser: PAGES_PER_USER })

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffIso = cutoff.toISOString()

  const results = items
    .filter(item => item.latestAt >= cutoffIso && matchesPerson(item.actors, person))
    .slice(0, limit)

  return { team, results }
}

const server = new Server(
  { name: 'peoplehub', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'find_project',
      description:
        'Search recent GitHub star/fork activity from your peoplehub team for a project matching a topic or keyword. ' +
        'Use this when someone mentioned a project but you don\'t remember its name — e.g. ' +
        '"jean-luc told me about a cool project about memory, find it for me".',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Keyword or topic to search for, e.g. "memory", "observability", "wasm runtime".',
          },
          person: {
            type: 'string',
            description: 'Optional GitHub username (or substring) to narrow the search to one teammate, e.g. "jean-luc".',
          },
          days: {
            type: 'number',
            description: 'How many days back to search. Defaults to 90.',
          },
          limit: {
            type: 'number',
            description: 'Max number of results to return. Defaults to 5.',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'list_team_activity',
      description:
        'List recent star/fork activity from your peoplehub team, optionally filtered to one person. ' +
        'Use this for "what has my team been starring lately" style questions.',
      inputSchema: {
        type: 'object',
        properties: {
          person: {
            type: 'string',
            description: 'Optional GitHub username (or substring) to filter to one teammate.',
          },
          days: {
            type: 'number',
            description: 'How many days back to look. Defaults to 7.',
          },
          limit: {
            type: 'number',
            description: 'Max number of results to return. Defaults to 20.',
          },
        },
      },
    },
    {
      name: 'list_team',
      description: 'List the GitHub usernames currently configured as the peoplehub team (via PEOPLEHUB_TEAM env var).',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args = {} } = request.params

  try {
    switch (name) {
      case 'find_project': {
        if (!args.query || typeof args.query !== 'string') {
          throw new Error('"query" is required')
        }
        const { team, results } = await findProject(args)
        const text = results.length === 0
          ? `No matches for "${args.query}" in the last ${args.days ?? 90} days from: ${team.join(', ')}.`
          : results.map(r => {
              const who = r.actors.join(', ')
              const verb = r.type === 'star' ? 'starred' : 'forked'
              const desc = r.description ? ` — ${r.description}` : ''
              return `${r.repo.fullName}${desc}\n  ${r.repo.htmlUrl}\n  ${verb} by ${who} (${r.latestAt})`
            }).join('\n\n')
        return { content: [{ type: 'text', text }] }
      }

      case 'list_team_activity': {
        const { team, results } = await listTeamActivity(args)
        const text = results.length === 0
          ? `No activity in the last ${args.days ?? 7} days from: ${team.join(', ')}.`
          : results.map(r => {
              const who = r.actors.join(', ')
              const verb = r.type === 'star' ? 'starred' : 'forked'
              return `${r.repo.fullName} — ${verb} by ${who} (${r.latestAt})\n  ${r.repo.htmlUrl}`
            }).join('\n\n')
        return { content: [{ type: 'text', text }] }
      }

      case 'list_team': {
        const team = getTeam()
        return { content: [{ type: 'text', text: team.join(', ') }] }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
