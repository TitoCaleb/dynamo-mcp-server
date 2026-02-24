import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDbClient } from '../repository';

export const describeTableDef = {
  name: 'describe_table',
  description:
    'Describe a DynamoDB table – key schema, attribute definitions, indexes, throughput, item count, and size.',
  inputSchema: {
    type: 'object',
    properties: {
      tableName: {
        type: 'string',
        description: 'Name of the DynamoDB table to describe',
      },
    },
    required: ['tableName'],
  },
};

export async function describeTable(args: Record<string, any>) {
  const response = await dynamoDbClient.send(
    new DescribeTableCommand({ TableName: args.tableName }),
  );

  const table = response.Table;
  const summary = {
    tableName: table?.TableName,
    tableStatus: table?.TableStatus,
    keySchema: table?.KeySchema,
    attributeDefinitions: table?.AttributeDefinitions,
    provisionedThroughput: table?.ProvisionedThroughput
      ? {
          readCapacityUnits: table.ProvisionedThroughput.ReadCapacityUnits,
          writeCapacityUnits: table.ProvisionedThroughput.WriteCapacityUnits,
        }
      : undefined,
    billingMode: table?.BillingModeSummary?.BillingMode ?? 'PROVISIONED',
    itemCount: table?.ItemCount,
    tableSizeBytes: table?.TableSizeBytes,
    globalSecondaryIndexes: table?.GlobalSecondaryIndexes?.map((gsi) => ({
      indexName: gsi.IndexName,
      keySchema: gsi.KeySchema,
      projection: gsi.Projection,
      itemCount: gsi.ItemCount,
    })),
    localSecondaryIndexes: table?.LocalSecondaryIndexes?.map((lsi) => ({
      indexName: lsi.IndexName,
      keySchema: lsi.KeySchema,
      projection: lsi.Projection,
    })),
    creationDateTime: table?.CreationDateTime?.toISOString(),
  };

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }],
  };
}
