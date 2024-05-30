import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const DB = new DynamoDBClient();

export default DB;