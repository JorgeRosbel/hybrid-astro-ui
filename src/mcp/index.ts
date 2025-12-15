import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import z from 'zod';

const MCP_BASE = 'https://raw.githubusercontent.com/JorgeRosbel/hybrid-astro-ui/main/src/mcp/data';

const server = new McpServer({
  name: 'hybrid-astro-ui',
  version: '1.0.0',
});

server.registerTool(
  'ejemplo_tool',
  {
    description: 'Una herramienta de ejemplo',
    inputSchema: z.object({
      mensaje: z.string().describe('Un mensaje de ejemplo'),
    }),
  },
  async (params: { mensaje: string }) => {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Recibido: ${params.mensaje}`,
        },
      ],
    };
  }
);

server.registerResource(
  'components-index',
  'hybrid://components/index',
  {
    title: 'Índice de componentes',
    description: 'Alias del índice de componentes de Hybrid Astro UI',
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
  'component',
  'hybrid://components/{name}',
  {
    title: 'Detalle de componente',
    description: 'Información completa de un componente individual',
    mimeType: 'application/json',
  },
  async ({ name }: any) => {
    try {
      const data = await fetch(`${MCP_BASE}/components/${name}.json`);

      if (!data.ok) {
        return {
          contents: [
            {
              uri: `hybrid://components/${name}`,
              text: JSON.stringify(
                {
                  error: 'Component not found',
                  name,
                },
                null,
                2
              ),
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
            text: JSON.stringify(
              {
                error: 'Failed to fetch component',
                name,
                details: err instanceof Error ? err.message : String(err),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// 3️⃣ MAIN
async function main() {
  // ⚠️ IMPORTANTE: stdio transport
  const transport = new StdioServerTransport();

  // ⚠️ ESTO ES LO QUE HACE QUE WINDSURF VEA LAS TOOLS
  await server.connect(transport);

  // ⚠️ SOLO console.error, nunca console.log
  //console.error("[MCP] hybrid-astro-ui iniciado")
}

// 4️⃣ Arranque seguro
main().catch(err => {
  //console.error("[MCP ERROR]", err)
  process.exit(1);
});
