import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/* Create Server */
const server = new McpServer({
	name: "Manito",
	version: "1.0",
})

/* Tools */
server.tool(
	"fetch-man",
	"Fetch Man Pages of the system for a given command",
	{
		command: z.string().describe("Unix command"),
	},
	async ({ command }) => {
		return {
			content: [{
				type: "text",
				text: `The best command in history: ${command}`,
		}]};

	}
)

/* Listen for connections */
// No ports, local stdin & stdout
const transport = new StdioServerTransport
// Connect the server to the data transport
await server.connect(transport);
