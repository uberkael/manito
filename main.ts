import { execSync } from 'child_process';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/* Create Server */
const server = new McpServer({
	name: "Manito",
	version: "1.0",
})

// Emulate $ from bun
const $ = (strings, ...values) => {
	const command = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
	const output = execSync(command, { encoding: 'utf8' });
	return output.trim();
};

/* Tools */
server.tool(
	"fetch-man",
	"Check Man Pages of the system for a given command",
	{
		command: z.string().describe("Unix command"),
	},
	async ({ command }) => {
		return {
			content: [{
				type: "text",
				text: $`man ${command} | col -b` }]
		}
	}
)

server.tool("check-uname",
	"check the system's uname",
	async ({}) => {
		let output = await $`uname -a`;
		return {
			content: [{ type: "text", text: output }]
		};
	}
);


/* Listen for connections */
// No ports, local stdin & stdout
const transport = new StdioServerTransport
// Connect the server to the data transport
await server.connect(transport);

export { server };
