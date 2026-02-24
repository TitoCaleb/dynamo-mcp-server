import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// No explicit region or credentials — the AWS SDK automatically infers both
// from the Lambda execution environment (IAM role + runtime metadata endpoint).
export const dynamoDbClient = new DynamoDBClient({});
