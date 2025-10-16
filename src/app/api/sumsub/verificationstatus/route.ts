import { headers } from "next/headers";
import { NextRequest } from "next/server";
import * as crypto from 'crypto';

export async function POST(request: NextRequest) {
  
  const body = await request.json();

  const { reviewResult } = body

  if(reviewResult.reviewAnswer !== 'GREEN') {
    console.log('El usuario NO ha pasado la verificacion!')
  } else console.log('El usuario ha pasado la verificacion!')

  console.log(reviewResult)
  
  return new Response(JSON.stringify(reviewResult), {
    status: 200,
    statusText: 'Webhook received',
    headers: { 'Content-Type': 'application/json' }
  });
}
