import { handlerPath } from '@libs/handler-resolver';
import {BUCKET} from "../../constants/common-constants";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: BUCKET,
        event: 's3:ObjectCreated:*',
        rules: [
          {
            prefix: 'uploaded/',
          },
        ],
        existing: true,
      },
    },
  ],
};
