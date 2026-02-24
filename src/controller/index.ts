import { McpAuthMiddleware, McpLambdaTransport } from '@blum-rivendell/mcp';

// Both singletons are initialized once on cold start and reused across
// warm Lambda invocations — same pattern as repositories in other MSs.

export const auth = new McpAuthMiddleware({
  mcpName: 'dynamodb-mcp',
  environment: process.env.ENVIRONMENT ?? 'dev',
  toolPermissions: {
    ADMIN: ['*'],
    AUDITOR: ['list_tables', 'describe_table', 'scan_table', 'query_table'],
    'dev-team': ['list_tables', 'describe_table', 'query_table'],
  },
  prodAllowedGroups: ['ADMIN'],
});

export const transport = new McpLambdaTransport({ auth });
