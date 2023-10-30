import * as AWS from "aws-sdk";

const catalogBatchProcess = async (event) => {
  const productRecords = event.Records.map(({ body }) => JSON.parse(body));

  if (!productRecords || !productRecords?.length) {
    throw new Error("No records found!");
  }

  try {
    for (const productRecord of productRecords) {
      const sns = new AWS.SNS();
      const message = {
        Subject: 'Product was added',
        Message: JSON.stringify(productRecord),
        TopicArn: process.env.SNS_ARN,
      };
      await sns.publish(message).promise();
    }
  } catch (error) {
    console.log("ERROR catalogBatchProcess Something went wrong!", error)
  }
};

export const main = catalogBatchProcess;
