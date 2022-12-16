import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as aws from 'aws-sdk'
const dynamoDb = new aws.DynamoDB.DocumentClient();
import {Card, CardRs} from './types/types'
import {decodeToken, responseOk, responseErr} from "./util/lib";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */


export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    if (event.body && event.headers.Authorization) {
        try {
            let {body} = JSON.parse(event.body)
            if (typeof body !== 'string') {
                throw new Error(`El token debe ser una cadena de 16 dígitos`);
            }

            // let card:Card = {cardNumber, cvv, expirationMonth, expirationYear, email}
            let key: string = event.headers.Authorization
            key = key.replace('Bearer ','')
            console.log(body, typeof body)
            console.log(key)
            const params = {
                TableName: 'test-TableJwt-EH2UPFBURB0D',
                Key: {
                    jwt: body
                }
            };
            let token = await dynamoDb.get(params).promise();
            let data:Card = decodeToken(token.Item?.jwt, key)
            const {cardNumber, expirationMonth,expirationYear, email} = data
            let result: CardRs = {cardNumber, expirationMonth,expirationYear, email}
            response = responseOk(result)
        } catch (err: unknown) {
            console.log("err", err);
            response = responseErr(err, 'Ha ocurrido un error')
        }
        return response;
    }

    response=responseErr(null,'Solicitud Inválida')

    return response;
};
