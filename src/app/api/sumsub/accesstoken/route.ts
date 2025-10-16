import { headers } from "next/headers";
import { NextRequest } from "next/server";
import * as crypto from 'crypto';

export async function POST(request: NextRequest) {
  
  const body = await request.json();
  const { address } = body;

  if(!address) {
    return new Response(JSON.stringify({ error: 'No address in the body request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* picking env variables */
  const appToken = process.env.SUMSUB_APP_TOKEN as string;
  const secretKey = process.env.SUMSUB_SECRET_KEY as string;
  const verificationLvl = process.env.SUMSUB_VERIFICATION_LEVEL as string;

  /* variables for signature */
  const timestamp = Math.round(Date.now() / 1000);
  const method = 'POST';
  const uriPath = '/resources/accessTokens/sdk'; // Endpoint correcto
  
  const requestBody = {
    userId: address,
    levelName: verificationLvl,
    ttlInSecs: 600
  };

  // Para el endpoint /sdk, la firma SÍ incluye el body
  const signatureString = timestamp + method + uriPath + JSON.stringify(requestBody);
  
  console.log('Signature string:', signatureString);
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(signatureString)
    .digest('hex');

  const response = await fetch('https://api.sumsub.com/resources/accessTokens/sdk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Token': appToken,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': timestamp.toString(),
    },
    body: JSON.stringify(requestBody)
  });

  const sumsubResponse = await response.json();
  console.log('Sumsub response:', sumsubResponse);
  
  if (!response.ok) {
    console.error('Sumsub error:', sumsubResponse);
    return new Response(JSON.stringify({ 
      error: 'Sumsub API error', 
      details: sumsubResponse 
    }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
 
  return new Response(JSON.stringify({ 
    token: sumsubResponse.token,
    userId: sumsubResponse.userId 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
/*
All requests must contain the following headers:

X-App-Token — an app token that you generate in the Dashboard.
X-App-Access-Sig — a request signature in the HEX format and lowercase.
X-App-Access-Ts — a number of seconds since Unix Epoch in UTC.
🚧
Attention

All API queries must be sent over HTTPS; plain HTTP will be refused. You must include your X-App headers in all requests.

Sign requests
The value of the X-App-Access-Sig header is generated with the sha256 HMAC algorithm using a secret key (provided upon app token generation) on the bytes obtained by concatenating the following information:

A timestamp (value of the X-App-Access-Ts header) taken as a string.
An HTTP method name in upper-case, for example, GET or POST.
URI of the request without a host name, starting with a slash and including all query parameters, for example, /resources/applicants/123?fields=info
Request body, taken exactly as it will be sent. If there is no request body, for example, for GET requests, do not include it.
The following is an example of the string to be signed to get an access token:

cURL

1607551635POST/resources/accessTokens?userId=cfd20712-24a2-4c7d-9ab0-146f3c142335&levelName=basic-kyc-level&ttlInSecs=600

*/