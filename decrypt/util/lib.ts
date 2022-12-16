import * as jwt from "jsonwebtoken";
import {Card} from '../types/types'
import {APIGatewayProxyResult} from 'aws-lambda'
import * as JWT from "jsonwebtoken";

export const decodeToken = (hash: any, pass:string):any => {
  const decryptedObject = JWT.verify(hash, pass);
  return decryptedObject
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
