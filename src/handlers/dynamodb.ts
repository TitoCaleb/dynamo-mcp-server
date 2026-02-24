import 'source-map-support/register';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { auth, transport } from '../controller';
import { TOOLS, TOOL_HANDLERS } from '../tools';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight (OPTIONS) — returns 204 immediately
  const preflight = transport.handlePreflight(event);
  if (preflight) return preflight;

  try {
    const { jsonrpc, authContext } = transport.parseRequest(event);
    const { method, id, params } = jsonrpc;

    // ── MCP Streamable HTTP protocol ─────────────────────────────────────────

    if (method === 'initialize') {
      return transport.createResponse(200, {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'dynamodb-mcp', version: '1.0.0' },
          capabilities: { tools: {} },
        },
      });
    }

    // Client notification after initialize — no meaningful body needed
    if (method === 'notifications/initialized') {
      return transport.createResponse(200, { jsonrpc: '2.0', id, result: {} });
    }

    if (method === 'tools/list') {
      return transport.createResponse(200, {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS },
      });
    }

    if (method === 'tools/call') {
      const toolName: string = params?.name;
      const toolArgs: Record<string, any> = params?.arguments ?? {};

      // Authorization: does this user's Cognito group allow this tool?
      auth.assertCanUseTool(authContext, toolName);

      const toolHandler = TOOL_HANDLERS[toolName];
      if (!toolHandler) {
        return transport.createResponse(404, {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${toolName}` },
        });
      }

      const result = await toolHandler(toolArgs);
      return transport.createResponse(200, { jsonrpc: '2.0', id, result });
    }

    return transport.createResponse(404, {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch (error) {
    return transport.createErrorResponse(error as Error);
  }
};
