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

// server.registerResource(
//   'component',
//   'hybrid://components/{name}',
//   {
//     title: 'Detalle de componente',
//     description: 'Información completa de un componente individual',
//     mimeType: 'application/json',
//   },
//   async ({ name }) => {
//     try {
//       const data = await fetch(`${MCP_BASE}/components/${name}.json`);

//       if (!data.ok) {
//         return {
//           contents: [
//             {
//               uri: `hybrid://components/${name}`,
//               text: JSON.stringify(
//                 {
//                   error: 'Component not found',
//                   name,
//                 },
//                 null,
//                 2
//               ),
//             },
//           ],
//         };
//       }
//       const componentJson = await data.text();
//       return {
//         contents: [
//           {
//             uri: `hybrid://components/${name}`,
//             text: componentJson,
//           },
//         ],
//       };
//     } catch (err) {
//       return {
//         contents: [
//           {
//             uri: `hybrid://components/${name}`,
//             text: JSON.stringify(
//               {
//                 error: 'Failed to fetch component',
//                 name,
//                 details: err instanceof Error ? err.message : String(err),
//               },
//               null,
//               2
//             ),
//           },
//         ],
//       };
//     }
//   }
// );

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
