# peoplehub MCP server

An [MCP](https://modelcontextprotocol.io) server that exposes peoplehub's
"who starred/forked what" feed as tools for AI agents like
[goose](https://block.github.io/goose/), Claude, or the Copilot CLI.

This lets you ask things like:

> "jean-luc at work told me about a cool project about memory, but I don't
> remember it, find it for me"

and have the agent search your team's recent GitHub star/fork activity for a
matching repo instead of you hunting through Slack history.

## Tools

- **`find_project`** — search recent star/fork activity for a repo matching a
  keyword or topic (matches repo name first, then falls back to the repo's
  GitHub description/topics/language for a bounded set of candidates).
  Optionally narrow to one teammate.
- **`list_team_activity`** — list recent star/fork activity, optionally
  filtered to one person. Good for "what has my team been starring lately?".
- **`list_team`** — list the GitHub usernames currently configured as the
  team.

## Setup

```bash
cd mcp-server
npm install
```

### Configuration (environment variables)

| Variable                    | Description                                                                 | Default                          |
|------------------------------|-------------------------------------------------------------------------------|-----------------------------------|
| `PEOPLEHUB_TEAM`             | Comma-separated GitHub usernames to track, e.g. `jean-luc,castrojo,thockin`   | The CNCF seed users used by the web app |
| `GITHUB_TOKEN` / `GH_TOKEN`  | Optional token to raise GitHub API rate limits (60/hr → 5,000/hr)             | none (unauthenticated)           |
| `PEOPLEHUB_PAGES_PER_USER`   | Pages of recent events (100 each) to fetch per user                          | `1`                               |

### Run standalone

```bash
PEOPLEHUB_TEAM=jean-luc,castrojo,thockin node index.mjs
```

The server communicates over stdio, so it's meant to be launched by an MCP
client rather than run interactively.

### goose config

Add to your goose config (`~/.config/goose/config.yaml`):

```yaml
extensions:
  peoplehub:
    type: stdio
    cmd: node
    args: ["/absolute/path/to/peoplehub/mcp-server/index.mjs"]
    env:
      PEOPLEHUB_TEAM: "jean-luc,castrojo,thockin"
```

### Claude Desktop / Copilot CLI config

Add to your MCP servers config (e.g. `claude_desktop_config.json` or the
Copilot CLI's MCP config):

```json
{
  "mcpServers": {
    "peoplehub": {
      "command": "node",
      "args": ["/absolute/path/to/peoplehub/mcp-server/index.mjs"],
      "env": {
        "PEOPLEHUB_TEAM": "jean-luc,castrojo,thockin"
      }
    }
  }
}
```
