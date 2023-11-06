import * as dotenv from 'dotenv';

dotenv.config();

const basicAuthorizer = async (event, ctx, cb) => {
  console.log('AUTH EVENT', event)
  const token = event.authorizationToken;
  if (!token) {
    cb('Unauthorized')
  };
  try {
    const storedPassword = process.env.River2015;
    const encodedCreds = token.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const plainCreds = buff.toString("utf-8").split(":");
    const [password] = plainCreds;

    const effect =
        !storedPassword || storedPassword !== password ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    cb(null, policy);
  } catch (e) {
    cb(`Unauthorized: ${e.message}`)
  }
};

const generatePolicy = (
    principalId: string,
    resource: string,
    effect = 'Allow'
) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

export const main = basicAuthorizer;
