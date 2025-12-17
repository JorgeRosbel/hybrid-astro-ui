import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GetPromptResult } from '@modelcontextprotocol/sdk/types';
import z from 'zod';

const MCP_BASE = 'https://raw.githubusercontent.com/JorgeRosbel/hybrid-astro-ui/main/src/mcp/data';

const componentFiles = [
  'ai-button.json',
  'animate-scroll.json',
  'avatar.json',
  'badge.json',
  'button.json',
  'card.json',
  'checkbox.json',
  'form-field.json',
  'input.json',
  'label.json',
  'list.json',
  'navigation-menu.json',
  'page-metadata.json',
  'pagination-controls.json',
  'post-meta.json',
  'preview-link.json',
  'review-stars.json',
  'scroll-area.json',
  'separator.json',
  'spinner.json',
  'textarea.json',
  'theme-toggle.json',
  'toggle.json',
  'tooltip.json',
  'select.json',
  'lite-yt.json',
  'bento-grid.json',
];

const server = new McpServer({
  name: 'hybrid-astro-ui',
  version: '1.0.0',
});

server.registerTool(
  'docs',
  {
    description: 'Documentation-only MCP. No actions are performed.',
    inputSchema: z.object({}),
  },
  async () => {
    return {
      content: [
        {
          type: 'text' as const,
          text: 'Documentation-only MCP. No action required.',
        },
      ],
    };
  }
);

server.registerResource(
  'components-index',
  'hybrid://components/index',
  {
    title: 'Components index',
    description: 'Alias for the Hybrid Astro UI components index',
    mimeType: 'application/json',
  },
  async () => {
    const data = await fetch(`${MCP_BASE}/components/index.json`);
    const indexJson = await data.text();

    return {
      contents: [
        {
          uri: 'hybrid://components/index',
          text: indexJson,
        },
      ],
    };
  }
);

server.registerResource(
  'hybrid-astro-ui-installation',
  'hybrid://utils/installation',
  {
    title: 'Installation Guide',
    description: 'Step-by-step instructions to install and configure Hybrid Astro UI',
    mimeType: 'application/json',
  },
  async () => {
    const data = await fetch(`${MCP_BASE}/utils/installation.json`);
    const indexJson = await data.text();

    return {
      contents: [
        {
          uri: 'hybrid://utils/installation',
          text: indexJson,
        },
      ],
    };
  }
);

componentFiles.forEach(file => {
  const name = file.replace('.json', '');

  server.registerResource(
    'component',
    `hybrid://components/${name}`,
    {
      title: `${name.charAt(0).toUpperCase() + name.slice(1)} Component`,
      description: `${name} component documentation`,
      mimeType: 'application/json',
    },
    async () => {
      try {
        const data = await fetch(`${MCP_BASE}/components/${file}`);
        if (!data.ok) {
          return {
            contents: [
              {
                uri: `hybrid://components/${name}`,
                text: JSON.stringify({ error: 'Component not found', name }),
              },
            ],
          };
        }
        const componentJson = await data.text();
        return {
          contents: [
            {
              uri: `hybrid://components/${name}`,
              text: componentJson,
            },
          ],
        };
      } catch (err) {
        return {
          contents: [
            {
              uri: `hybrid://components/${name}`,
              text: JSON.stringify({
                error: 'Failed to fetch component',
                name,
                details: '',
              }),
            },
          ],
        };
      }
    }
  );
});

server.registerPrompt(
  'explain_component',
  {
    description: 'Explain a Hybrid Astro UI component using official documentation',
    argsSchema: {
      component: z.string().describe('Component name (e.g. button, card)'),
    },
  },
  async ({ component }): Promise<GetPromptResult> => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `
You are an expert in Hybrid Astro UI.

Use ONLY the official documentation provided via MCP resources.
Do NOT invent props, variants, or behaviors.

Explain the ${component} component with:
- Purpose
- When to use it
- Props / variants
- Accessibility considerations
- Minimal Astro example
            `.trim(),
          },
        },
      ],
    };
  }
);

server.registerPrompt(
  'generate_component',
  {
    description: 'Generate a production-ready Hybrid Astro UI component',
    argsSchema: {
      component: z.string().describe('Component name'),
    },
  },
  async ({ component }): Promise<GetPromptResult> => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `
Generate a PRODUCTION-READY "${component}" component for Hybrid Astro UI.

Requirements:
- Astro component (.astro)
- Fully self-contained
- Follow existing Hybrid Astro UI patterns and conventions
- Prefer native HTML elements where appropriate
- Do NOT invent new base components
- Props typed using TypeScript
- Accessible by default (ARIA, keyboard navigation, semantics)
- No React
- No unnecessary runtime JavaScript
- Suitable for real-world usage, not a demo

Icons:
- Use icons from "lucide-astro" ONLY when they add value
- Import icons explicitly, for example:
  import CircleAlert from '@lucide/astro/icons/circle-alert';
- Do NOT inline SVGs
- Do NOT use other icon libraries

Output:
- Full component code only
- No explanations
            `.trim(),
          },
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch(err => {
  process.exit(1);
});

// Dev mode:
// {
//   "mcpServers": {
//     "hybrid-astro-ui-mcp": {
//       "args": [
//         "-e",
//         "node",
//         "/home/rosbeldev/astro-ui-components/cli/dist/mcp.mjs"
//       ],
//       "command": "wsl",
//       "disabled": false
//     }
//   }
// }

// Prod:
// {
//   "mcpServers": {
//     "hybrid-astro-ui-mcp": {
//       "command": "npx",
//       "args": ["--package", "hybrid-astro-ui", "hybrid-astro-ui-mcp"],
//       "disabled": false
//     }
//   }
// }
