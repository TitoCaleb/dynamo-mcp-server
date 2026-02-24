import { ScanCommand, type AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from '../repository';

export const scanTableDef = {
  name: 'scan_table',
  description:
    'Scan a DynamoDB table and return items. Use sparingly on large tables. Supports filtering, projections, and pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      tableName: { type: 'string', description: 'Name of the DynamoDB table to scan' },
      limit: { type: 'number', description: 'Max number of items to return. Default: 25' },
      filterExpression: {
        type: 'string',
        description: "DynamoDB filter expression (e.g. 'attribute_exists(email)')",
      },
      expressionAttributeNames: {
        type: 'string',
        description: 'JSON string mapping expression attribute name placeholders (e.g. \'{"#s": "status"}\')',
      },
      expressionAttributeValues: {
        type: 'string',
        description: "JSON string of expression attribute values in DynamoDB JSON format (e.g. '{\": val\": {\"S\": \"active\"}}')",
      },
      projectionExpression: {
        type: 'string',
        description: 'Comma-separated list of attributes to return',
      },
      exclusiveStartKey: {
        type: 'string',
        description: 'JSON string of start key for pagination (DynamoDB JSON format)',
      },
      indexName: { type: 'string', description: 'Name of a secondary index to scan' },
    },
    required: ['tableName'],
  },
};

export async function scanTable(args: Record<string, any>) {
  const parsedNames = args.expressionAttributeNames
    ? (JSON.parse(args.expressionAttributeNames) as Record<string, string>)
    : undefined;
  const parsedValues = args.expressionAttributeValues
    ? (JSON.parse(args.expressionAttributeValues) as Record<string, AttributeValue>)
    : undefined;
  const parsedStartKey = args.exclusiveStartKey
    ? (JSON.parse(args.exclusiveStartKey) as Record<string, AttributeValue>)
    : undefined;

  const response = await dynamoDbClient.send(
    new ScanCommand({
      TableName: args.tableName,
      Limit: args.limit ?? 25,
      FilterExpression: args.filterExpression,
      ExpressionAttributeNames: parsedNames,
      ExpressionAttributeValues: parsedValues,
      ProjectionExpression: args.projectionExpression,
      ExclusiveStartKey: parsedStartKey,
      IndexName: args.indexName,
    }),
  );

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            items: response.Items ? response.Items.map((i) => unmarshall(i)) : [],
            count: response.Count,
            scannedCount: response.ScannedCount,
            lastEvaluatedKey: response.LastEvaluatedKey
              ? unmarshall(response.LastEvaluatedKey)
              : null,
          },
          null,
          2,
        ),
      },
    ],
  };
}
