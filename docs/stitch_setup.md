# Stitch MCP Installation Guide

To allow me to use **Stitch** for your redesign, you need to install the Stitch MCP server and add it to your configuration.

### 1. Install Stitch MCP Server
Run the following command in your terminal:
```bash
npm install -g @google/stitch-mcp
```

### 2. Configure Claude Desktop / Antigravity
Open your `claude_desktop_config.json` (usually found in `%APPDATA%\Claude\claude_desktop_config.json` or your agent settings) and add the following entry under `mcpServers`:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": [
        "-y",
        "@google/stitch-mcp"
      ],
      "env": {
        "STITCH_PROJECT_ID": "YOUR_PROJECT_ID_HERE"
      }
    }
  }
}
```

### 3. Restart the Agent
Once configured, restart this session. I will then have access to the `stitch` tools to generate and fetch layouts directly.

---
**Note**: If you don't have a Project ID yet, you can create one at [stitch.withgoogle.com](https://stitch.withgoogle.com).
