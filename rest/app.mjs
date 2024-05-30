import { nanoid } from "nanoid";
import { v4 as uuid } from 'uuid';
import DB from "./dbConfig.js";
import { GetItemCommand, PutItemCommand , DeleteItemCommand , UpdateItemCommand , ScanCommand} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
// marshall -> convert javascript object to dynamoDB record
// unmarshall -> convert dynamo record to ajavascript oobject
let response;

const tableName = "user-table";
export const StartServerHandler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        message: "Serverless is running...",
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 404,
      body: JSON.stringify({
        status: "Failure",
        message: "Failed to start Server",
        error: err,
      }),
    };
  }
};

export const fetchAllUserHandler = async (event, context) => {
  try {
    const { Items } = await DB.send(new ScanCommand({ TableName: tableName }))

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        message: "Fetched All User successfully!",
        usersData: Items.map(item => unmarshall(item)),
        rawData: Items
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 404,
      body: JSON.stringify({
        status: "Failure",
        message: "Failed to Fetch All User",
        errorMsg: err.message,
        errorStack: err.stack,
      }),
    };
  }
};

export const fetchOneUserHandler = async (event, context) => {
  try {
    const params = {
      TableName: tableName,
      Key: marshall({id: event.pathParameters.id}),
    }

    const { Item } = await DB.send(new GetItemCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        message: "Fetched One User successfully!",
        user: unmarshall(Item),
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 404,
      body: JSON.stringify({
        status: "Failure",
        message: "Failed to Fetch One User",
        errorMsg: err.message,
        errorStack: err.stack,
      }),
    };
  }
};

export const createUserHandler = async (event, context) => {
  const { name, pincode, email, pass, phone, area } = JSON.parse(
    event.body
  );
  try {
    const newUser = {
      id: uuid(),
      name,
      pincode,
      email,
      pass,
      phone,
      area,
    };

    const params = {
      TableName: tableName,
      Item: marshall(newUser)
    }

    const createdUser = await DB.send(new PutItemCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        message: "User Created successfully!",
        createdUser
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 404,
      body: JSON.stringify({
        status: "Failure",
        message: "Failed to Create User",
        errorMsg: err.message,
        errorStack: err.stack,
      }),
    };
  }
};

export const updateUserHandler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);

    const params = {
      TableName: tableName,
      Key: marshall({id: event.pathParameters.id}),
      UpdateExpression: `SET ${objKeys.map((_ , index) => `#key${index} = :value${index}` )}`,
      ExpressionAttributeNames: objKeys.reduce((acc , key , index) => ({
        ...acc,
        [`#key${index}`]: key,
      }) , {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc , key, index) => ({
        ...acc,
        [`:value${index}`]: body[key],
      }) , {})),
      ReturnValues: "UPDATED_NEW",
    }

    const updatedUser = await DB.send(new UpdateItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        message: "User Updated successfully!",
        updatedUser,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 404,
      body: JSON.stringify({
        status: "Failure",
        message: "Failed to Update User",
        errorMsg: err.message,
        errorStack: err.stack,
      }),
    };
  }
};

export const deleteUserHandler = async (event, context) => {
  try {

    const params = {
      TableName: tableName,
      Key: marshall({id: event.pathParameters.id}),
    }

    const deleteUser = await DB.send(new DeleteItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        message: "User deleted successfully!",
        user: deleteUser,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 404,
      body: JSON.stringify({
        status: "Failure",
        message: "Failed to Delete User",
        errorMsg: err.message,
        errorStack: err.stack,
      }),
    };
  }
};
