import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const productWriteDDBTable = async(data) => {
    const command = new PutCommand({
        TableName: process.env.PRODUCTS_TABLE,
        Item: data,
    });

    const response = await docClient.send(command);
    return response;
}

const stockWriteDDBTable = async(data) => {
  const command = new PutCommand({
    TableName: process.env.PRODUCTS_STOCK_TABLE,
    Item: data,
  });

  const response = await docClient.send(command);
  return response;
}

const createProduct: ValidatedEventAPIGatewayProxyEvent<
    any
    > = async (event) => {
    // @ts-ignore
    const payload = JSON.parse(event.body);
    // error of empty data
    const id = uuidv4();
    const product = {
        id,
        title: payload.title,
        description: payload.description,
        price: payload.price,
    }

    const stock = {
        product_id: id,
        count: payload.count
    }

    const newProduct = await productWriteDDBTable(product).catch(err => {
        console.log('error in dynamo write', err);
        return null;
    });

    const newStock = await stockWriteDDBTable(stock).catch(err => {
        console.log('error in dynamo write', err);
        return null;
    });

   return formatJSONResponse(product);
};

export const main = createProduct;
