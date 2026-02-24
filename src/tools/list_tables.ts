import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDbClient } from '../repository';

export const listTablesDef = {
  name: 'list_tables',
  description:
    'List all DynamoDB tables in the configured AWS account/region. Supports pagination via exclusiveStartTableName.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Max number of tables to return (1-100). Default: 100',
      },
      exclusiveStartTableName: {
        type: 'string',
        description: 'Table name to start listing from (for pagination)',
      },
    },
  },
};

export async function listTables(args: Record<string, any>) {
  const response = await dynamoDbClient.send(
    new ListTablesCommand({
      Limit: args.limit ?? 100,
      ExclusiveStartTableName: args.exclusiveStartTableName,
    }),
  );

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            tables: response.TableNames ?? [],
            lastEvaluatedTableName: response.LastEvaluatedTableName ?? null,
          },
          null,
          2,
        ),
      },
    ],
  };
}
