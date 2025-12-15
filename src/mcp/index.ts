import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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
];

const server = new McpServer({
  name: 'hybrid-astro-ui',
  version: '1.0.0',
});

server.registerTool(
  'example_tool',
  {
    description: 'placeholder',
    inputSchema: z.object({
      mensaje: z.string().describe('foo'),
    }),
  },
  async (params: { mensaje: string }) => {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Re: ${params.mensaje}`,
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

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch(err => {
  process.exit(1);
});
