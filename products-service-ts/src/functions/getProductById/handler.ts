import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const productByIdDDBTableData = async(id) => {
  const command = new GetCommand({
    TableName: process.env.PRODUCTS_TABLE,
    Key: {
      id: id,
    },
  });

  const response = await docClient.send(command);
  return response;
}

const stockByIdDDBTableData = async(id) => {
  const command = new GetCommand({
    TableName: process.env.PRODUCTS_STOCK_TABLE,
    Key: {
      product_id: id,
    },
  });

  const response = await docClient.send(command);
  return response;
}

const getProductById: ValidatedEventAPIGatewayProxyEvent<
    any
    > = async (event) => {
  const productId = event.pathParameters
      ? event.pathParameters.productId
      : null;

  const product = await productByIdDDBTableData(productId).then((res) => res.Item);
  const stock = await stockByIdDDBTableData(productId).then(res => res.Item);
  const count = stock?.count || 0;
  const image = 'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg';

  if (!productId || !product) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ error: "productId is missing" }),
    };
  }

  return formatJSONResponse({ ...product, count, image});
};

export const main = getProductById;
