import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const productsDDBTableData = async() => {
  const command = new ScanCommand({
    TableName: process.env.PRODUCTS_TABLE,
  });

  const response = await docClient.send(command);
  return response;
}

const stocksDDBTableData = async() => {
  const command = new ScanCommand({
    TableName: process.env.PRODUCTS_STOCK_TABLE,
  });

  const response = await docClient.send(command);
  return response;
}

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async () => {
  let products = await productsDDBTableData().catch(err => {
    console.log('error in Dynamo scan', err);
    return null;
  }).then((res) => res.Items);
  const stocks = await stocksDDBTableData().catch(err => {
    console.log('error in Dynamo scan', err);
    return null;
  }).then((res) => res.Items);

  if (!products) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ error: "productId is missing" }),
    };
  }
  const body = products.map(product => {
    const stock = stocks.find(stock => stock.product_id === product.id);
    const count = stock?.count || 0;
    const image = 'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg';
    return {...product, count, image,}
  });
  return formatJSONResponse(body)
};

export const main = getProductsList;
