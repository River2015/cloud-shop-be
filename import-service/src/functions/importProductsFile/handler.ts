import * as dotenv from 'dotenv';
import { middyfy } from '@libs/lambda';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { BUCKET } from '../../constants/common-constants'

dotenv.config();

const s3 = new AWS.S3({ region: 'eu-west-1' });

export const importProductsFile = async (event: APIGatewayProxyEvent) => {
    try {
        const s3Params = {
            Bucket: BUCKET,
            Key: `uploaded/${event.queryStringParameters.name}`,
            Expires: 300,
            ContentType: 'text/csv',
        };
        const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);
        return {
            statusCode: 200,
            body: JSON.stringify(uploadURL),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
        };
    } catch (err) {
        return {
            statusCode: 200,
            body: JSON.stringify(err),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
        };
    }
};

export const main = middyfy(importProductsFile);
