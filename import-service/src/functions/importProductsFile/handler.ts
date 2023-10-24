import { middyfy } from '@libs/lambda';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {BUCKET, REGION} from '../../constants/common-constants'
import {formatJSONResponse} from "@libs/api-gateway";

const s3 = new AWS.S3({ region: REGION });

export const importProductsFile = async (event: APIGatewayProxyEvent) => {
    try {
        const s3Params = {
            Bucket: BUCKET,
            Key: `uploaded/${event.queryStringParameters.name}`,
            Expires: 300,
            ContentType: 'text/csv',
        };
        const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);
        return formatJSONResponse(uploadURL, 200);
    } catch (err) {
        return formatJSONResponse(err, 500)
    }
};

export const main = middyfy(importProductsFile);
