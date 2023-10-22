import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { productsMock } from "../../../mocks/products";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async () => {
  return formatJSONResponse(productsMock)
};

export const main = getProductsList;
