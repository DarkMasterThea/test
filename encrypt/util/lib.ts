import * as jwt from "jsonwebtoken";
import {Card} from '../types/types'
import {APIGatewayProxyResult} from 'aws-lambda'
export const luhn = (input: string) => {
  let sum = 0;
  let numdigits = input.length;
  let parity = numdigits % 2;
  for (let i = numdigits - 1; i >= 0; i--) {
    let digit = parseInt(input.charAt(i));
    if (i % 2 == parity) digit *= 2;
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 == 0;
};

export const generateToken = (card: Card, pass:string):string => {
  const encryptedObject = jwt.sign(card, pass, { expiresIn: '15m' });
  return encryptedObject
};

export const responseOk = (body:any): APIGatewayProxyResult=>{
  return {statusCode: 200,
    body: JSON.stringify({
      message: body
    })}
};

export const responseErr = (err:any, msg: string): APIGatewayProxyResult=>{
  if (err == null){
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: msg,
      }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : msg,
      }),
    };
  }

};
