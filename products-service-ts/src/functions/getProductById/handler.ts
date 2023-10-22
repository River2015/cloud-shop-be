import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { productsMock } from "../../../mocks/products";

const getProduct = (id: number) =>
    productsMock.find((product) => product.id === id);

const getProductById: ValidatedEventAPIGatewayProxyEvent<
    any
    > = async (event) => {
  const productId = event.pathParameters
      ? event.pathParameters.productId
      : null;
  const product = getProduct(Number(productId));

  if (!productId || !product) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ error: "productId is missing" }),
    };
  }
  return formatJSONResponse(product);
};

export const main = getProductById;
