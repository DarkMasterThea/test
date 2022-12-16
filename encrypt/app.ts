import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as aws from 'aws-sdk'
import {Card} from './types/types'
const dynamoDb = new aws.DynamoDB.DocumentClient();
import {luhn, generateToken, responseOk, responseErr} from "./util/lib";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const emailRegex = /^\w+([\.-]?\w+)*@(gmail|hotmail|yahoo)\.com$/;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    if (event.body && event.headers.Authorization) {
        try {
            let {cardNumber, cvv, expirationMonth, expirationYear, email} = JSON.parse(event.body)
            if (typeof cardNumber !== 'number' || cardNumber.toString().length < 13 ||
                cardNumber.toString().length > 16 || luhn(cardNumber.toString())) {
                throw new Error(`El número de tarjeta debe ser un número entre 13 y 16 dígitos`);
            }
            if (typeof cvv !== 'number' || cvv.toString().length < 3 ||
                cvv.toString().length > 4) {
                throw new Error(`El cvv debe ser un número entre 3 y 4 dígitos`);
            }
            if (typeof expirationMonth !== 'string' || expirationMonth.length < 1 ||
                expirationMonth.length > 2 || parseInt(expirationMonth)<1 || parseInt(expirationMonth)>12) {
                throw new Error(`El mes de expiración debe estar entre 1 y 12`);
            }
            if (typeof expirationYear !== 'string' || expirationYear.length != 4 ||
                parseInt(expirationMonth)>5000) {
                throw new Error(`El año de expiración debe estar entre 1000 y 5000 años`);
            }
            if (!emailRegex.test(email)) throw new Error(`El correo es inválido`);
            let card:Card = {cardNumber, cvv, expirationMonth, expirationYear, email}
            let key: string = event.headers.Authorization
            key = key.replace('Bearer ','')

            let token:string = generateToken(card, key)
            const params = {
                TableName: 'test-TableJwt-EH2UPFBURB0D',
                Item: {
                    jwt: token
                }
            };
            await dynamoDb.put(params).promise();
            response = responseOk(token)
        } catch (err: unknown) {
            console.log("err", err);
            response = responseErr(err, 'Ha ocurrido un error')
        }
        return response;
    }

    response=responseErr(null,'Solicitud Inválida')

    return response;

};
