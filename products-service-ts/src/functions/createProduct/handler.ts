import {formatJSONResponse, responseError500} from '@libs/api-gateway';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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

export const createProduct = async (event, context, callback) => {
    // @ts-ignore
    const payload = JSON.parse(event.body);

    if (!payload || !payload.Price || !payload.Title || !payload.Count || !payload.Description) {
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Product data is invalid.' })
        });
    }
    const id = uuidv4();
    const product = {
        id,
        title: payload.Title,
        description: payload.Description,
        price: payload.Price,
    }

    const stock = {
        product_id: id,
        count: payload.Count
    }

    const newProduct = await productWriteDDBTable(product).catch((err) => {
        return responseError500('error in dynamo write');
    });

    const newStock = await stockWriteDDBTable(stock).catch((err) => {
        return responseError500('error in dynamo write');
    });

   return formatJSONResponse(product);
};

export const main = createProduct;
