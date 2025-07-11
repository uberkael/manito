import express, { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "./main.js";


const app = express();
app.use(express.json());

const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
	sessionIdGenerator: undefined, // set to undefined for stateless servers
});

// Setup routes for the server
const setupServer = async () => {
	await server.connect(transport);
};

app.post('/mcp', async (req: Request, res: Response) => {
	console.log('Received MCP request:', req.body);
	try {
		await transport.handleRequest(req, res, req.body);
	} catch (error) {
		console.error('Error handling MCP request:', error);
		if (!res.headersSent) {
			res.status(500).json({
				jsonrpc: '2.0',
				error: {
					code: -32603,
					message: 'Internal server error',
				},
				id: null,
			});
		}
	}
});

app.get('/mcp', async (req: Request, res: Response) => {
	console.log('Received GET MCP request');
	res.writeHead(405).end(JSON.stringify({
		jsonrpc: "2.0",
		error: {
			code: -32000,
			message: "Method not allowed."
		},
		id: null
	}));
});

app.delete('/mcp', async (req: Request, res: Response) => {
	console.log('Received DELETE MCP request');
	res.writeHead(405).end(JSON.stringify({
		jsonrpc: "2.0",
		error: {
			code: -32000,
			message: "Method not allowed."
		},
		id: null
	}));
});

const PORT = process.env.PORT || 3000;
setupServer().then(() => {
	app.listen(PORT, () => {
		console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
	});
}).catch(error => {
	console.error('Failed to set up the server:', error);
	process.exit(1);
});
