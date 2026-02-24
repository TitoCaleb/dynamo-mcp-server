import { QueryCommand, type AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from '../repository';

export const queryTableDef = {
  name: 'query_table',
  description:
    'Query a DynamoDB table using a key condition expression. More efficient than scan for targeted lookups.',
  inputSchema: {
    type: 'object',
    properties: {
      tableName: { type: 'string', description: 'Name of the DynamoDB table to query' },
      keyConditionExpression: {
        type: 'string',
        description: 'Key condition expression (e.g. "PK = :pk AND begins_with(SK, :prefix)")',
      },
      expressionAttributeValues: {
        type: 'string',
        description: "JSON string of expression attribute values in DynamoDB JSON format (e.g. '{\": pk\": {\"S\": \"USER#123\"}}')",
      },
      expressionAttributeNames: {
        type: 'string',
        description: 'JSON string mapping expression attribute name placeholders',
      },
      filterExpression: {
        type: 'string',
        description: 'Additional filter expression applied after the query',
      },
      projectionExpression: {
        type: 'string',
        description: 'Comma-separated list of attributes to return',
      },
      limit: { type: 'number', description: 'Max number of items to return. Default: 25' },
      scanIndexForward: {
        type: 'boolean',
        description: 'true = ascending order, false = descending. Default: true',
      },
      exclusiveStartKey: {
        type: 'string',
        description: 'JSON string of start key for pagination (DynamoDB JSON format)',
      },
      indexName: { type: 'string', description: 'Name of a secondary index to query' },
    },
    required: ['tableName', 'keyConditionExpression', 'expressionAttributeValues'],
  },
};

export async function queryTable(args: Record<string, any>) {
  const parsedValues = JSON.parse(args.expressionAttributeValues) as Record<
    string,
    AttributeValue
  >;
  const parsedNames = args.expressionAttributeNames
    ? (JSON.parse(args.expressionAttributeNames) as Record<string, string>)
    : undefined;
  const parsedStartKey = args.exclusiveStartKey
    ? (JSON.parse(args.exclusiveStartKey) as Record<string, AttributeValue>)
    : undefined;

  const response = await dynamoDbClient.send(
    new QueryCommand({
      TableName: args.tableName,
      KeyConditionExpression: args.keyConditionExpression,
      ExpressionAttributeValues: parsedValues,
      ExpressionAttributeNames: parsedNames,
      FilterExpression: args.filterExpression,
      ProjectionExpression: args.projectionExpression,
      Limit: args.limit ?? 25,
      ScanIndexForward: args.scanIndexForward ?? true,
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
