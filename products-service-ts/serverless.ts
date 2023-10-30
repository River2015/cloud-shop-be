import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductById from '@functions/getProductById';
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";

const serverlessConfiguration: AWS = {
  service: 'products-service-ts',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-auto-swagger'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE: 'products_table',
      PRODUCTS_STOCK_TABLE: 'stocks_table',
      SQS_URL: 'SQSQueue',
      SNS_ARN: 'arn:aws:sns:eu-west-1:271763034164:createProductTopic'
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: ['dynamodb:*'],
      Resource: '*'
    },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: '*'
      },
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: '*'
      }
    ],
  },
  // import the function via paths
  functions: { getProductsList, getProductById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    autoswagger: {
      host: 'mvg8btfnfa.execute-api.eu-west-1.amazonaws.com/dev'
    },
    productTableName: 'products_table',
    stocksTableName: 'stocks_table',
  },
  resources: {
    Resources: {
      ProductsDynamoDbTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'products_table',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S'
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH'
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3,
          },
        }
      },
      StocksDynamoDbTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'stocks_table',
          AttributeDefinitions: [{
            AttributeName: 'product_id',
            AttributeType: 'S'
          }],
          KeySchema: [{
            AttributeName: 'product_id',
            KeyType: 'HASH'
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3,
          },
        }
      },
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'uliaulia083@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: "SNSTopic",
          }
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
