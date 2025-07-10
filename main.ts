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
	const command = strings.reduce(
		(acc, str, i) => acc + str + (values[i] ?? ''), '');
	const output = execSync(command, { encoding: 'utf8' });
	return output.trim();
};

/* Tools */
function allManPages(command: string): string[] {
	try {
		return $`man -f ${command}`.split("\n");
	}
	catch (error) {
		return [];
	}
}

function getManPage(command: string): string {
	try {
		// return $`man ${command} | col -b`;
		const man = $`man ${command}`;
		return `System Reference Manual (Man Page) for ${command}:\n${man}`;
	}
	catch (error) {
		return `No manual entry for ${command}`;
	}
}

function getHelpText(command): string {
	const helpArguments = ["--help", "-h"];
	for (const arg of helpArguments) {
		try {
			const help = $`${command} ${arg}`
			return `Help for ${command}:\n${help}`;
		} catch (error) {
			continue
		}
	}
	return `No help entry for ${command}`;
}

server.tool(
	"fetch-man",
	"Check Man Page for a given command",
	{ command: z.string().describe("Unix Command") },
	async ({ command }) => {
		const pages = allManPages(command);
		if (pages.length === 0) {
			return {
				content: [{
					type: "text",
					text: getHelpText(command) }]
			};
		}
		return {
			content: [{
				type: "text",
				text: getManPage(command) }]
		}
	}
)

server.tool("check-uname",
	"Check The System's Uname",
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
