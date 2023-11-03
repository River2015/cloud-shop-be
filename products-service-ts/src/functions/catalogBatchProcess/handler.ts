import * as AWS from "aws-sdk";
import {createProduct} from "@functions/createProduct/handler";

const catalogBatchProcess = async (event) => {
  const productRecords = event.Records.map(({ body }) => JSON.parse(body));

  if (!productRecords || !productRecords?.length) {
    throw new Error("No records found!");
  }

  try {
    for (const productRecord of productRecords) {
      await createProduct({body: JSON.stringify(productRecord)}, null, (err) => {
        if (err) {
          console.log('catalogBatchProcess in createProduct ERR', err)
        }
      });
      const sns = new AWS.SNS();
      const message = {
        Subject: 'Product was added',
        Message: JSON.stringify(productRecord),
        TopicArn: process.env.SNS_ARN,
        // MessageAttributes: {
        //   event: {
        //     DataType: 'String',
        //     StringValue: 'Title',
        //   },
        //   Title: {
        //     DataType: 'String',
        //     StringValue: productRecord.replace(/^\uFEFF/gi, '').description,
        //   },
        // },
      };
      await sns.publish(message).promise();

    }
  } catch (error) {
    console.log("ERROR catalogBatchProcess Something went wrong!", error)
  }
};

export const main = catalogBatchProcess;
