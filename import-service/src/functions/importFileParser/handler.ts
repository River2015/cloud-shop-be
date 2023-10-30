import {BUCKET, REGION} from '../../constants/common-constants'
import {Handler} from "aws-lambda";
import * as path from "path";
import csvParser from "csv-parser";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3({ region: REGION });

const importFileParser: Handler = async (event) => {
    try {
        console.log("import file parser EVENT", event);
        for (const record of event.Records) {
            const objectName = record.s3.object.key;
            if (objectName) {
                const params = {
                    Bucket: BUCKET,
                    Key: objectName,
                };

                const parse = (stream) =>
                    new Promise((_resolve, reject) => {
                        const sqs = new AWS.SQS();
                        stream.on("data", (data) => {
                            sqs.sendMessage({
                                QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/271763034164/catalogItemsQueue',
                                MessageBody: JSON.stringify(data)
                            },  (err, data) => {
                                if (err) {
                                    console.log("Error", err);
                                } else {
                                    console.log("Success", data.MessageId);
                                }
                            })
                        });
                        stream.on("error", (error) => {
                            console.log(error);
                            reject();
                        });
                        stream.on("end", async () => {
                            console.log("CSV file parsing was finished");
                            try {
                                const copyParams = {
                                    Bucket: BUCKET,
                                    CopySource: `/${BUCKET}/${objectName}`,
                                    Key: objectName.replace('uploaded', 'parsed'),
                                };

                                await s3.copyObject(copyParams).promise();
                                const dstKey = path.join("parsed", path.basename(objectName));
                                console.log(`File was copied to ${dstKey}`);
                                await s3.deleteObject(params).promise();
                                console.log(`File was deleted from ${objectName}`);

                            } catch (err) {
                                console.log(`ERROR in importFileParser of copying or deleting file: ${err}`);
                            }
                        });
                    });

                const s3Stream = s3.getObject(params).createReadStream();

                await parse(s3Stream.pipe(csvParser()));
            }
        }
    } catch (err) {
        console.log('Something went wrong!')
    }
};

export const main = importFileParser;
