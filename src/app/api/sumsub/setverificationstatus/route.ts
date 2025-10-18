import { NextRequest } from "next/server";
import * as crypto from 'crypto';
import { createClient } from "@/utils/database";
import { generateEIP712Signature } from "@/utils/server";
import { ethers } from "ethers";

export async function POST(request: NextRequest) {

  const bodyText = await request.text();

  const digest = request.headers.get('x-payload-digest');
  const algorithm = request.headers.get('x-payload-digest-alg');

  if (!digest || !algorithm) {
    console.error('❌ Webhook sin headers de firma');
    return new Response(JSON.stringify({ error: 'Missing signature headers' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let hashAlgorithm: string;

  switch (algorithm) {
    case 'HMAC_SHA256_HEX':
      hashAlgorithm = 'sha256';
      break;
    case 'HMAC_SHA512_HEX':
      hashAlgorithm = 'sha512';
      break;
    case 'HMAC_SHA1_HEX':
      hashAlgorithm = 'sha1';
      console.warn('⚠️ SHA1 está obsoleto, considera cambiar a SHA256');
      break;
    default:
      console.error('❌ Algoritmo desconocido:', algorithm);
      return new Response(JSON.stringify({ error: 'Unsupported algorithm' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
  }

  const secretKey = process.env.SUMSUB_WEBHOOK_SECRET_KEY as string;
  const expectedDigest = crypto
    .createHmac(hashAlgorithm, secretKey)
    .update(bodyText)
    .digest('hex');

  if (digest.toLowerCase() !== expectedDigest.toLowerCase()) {
    console.error('❌ Firma inválida');
    console.error('Recibido:', digest);
    console.error('Esperado:', expectedDigest);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Webhook signature válida (' + algorithm + ')');

  const body = JSON.parse(bodyText);
  const { reviewResult, externalUserId, applicantId } = body;

  // Validar que externalUserId sea una address válida
  if (!ethers.isAddress(externalUserId)) {
    console.warn('⚠️ externalUserId no es una address válida (probablemente test):', externalUserId);
    return new Response(JSON.stringify({ 
      received: true,
      message: 'Ignored - invalid address format (test webhook?)' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

// Continúa con el resto...

  const supabase = await createClient();

  if (!supabase) {
    console.error('❌ Error creando cliente de Supabase');
    return new Response(JSON.stringify({ error: 'Database connection failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log('✅ Cliente de Supabase creado con éxito');

  if (reviewResult?.reviewAnswer === 'GREEN') {
    console.log('✅ Usuario pasó verificación:', externalUserId);

    const { signature, nonce, expiry } = await generateEIP712Signature(externalUserId);

    const { data, error } = await supabase
      .from('kyc_verifications')
      .upsert({
        wallet_address: externalUserId,
        applicant_id: applicantId,
        kyc_status: 'approved',
        signature: signature,
        nonce: Number(nonce),
        expiry: expiry
      }, {
        onConflict: 'wallet_address'
      });

    if (error) {
      console.error('❌ Error guardando en DB:', error);
      return new Response(JSON.stringify({ error: 'Database error', details: error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Usuario aprobado guardado en DB');

  } else if (reviewResult?.reviewAnswer === 'RED') {
    console.log('❌ Usuario NO pasó verificación:', externalUserId);

    const { data, error } = await supabase
      .from('kyc_verifications')
      .upsert({
        wallet_address: externalUserId,
        applicant_id: applicantId,
        kyc_status: 'rejected'
      }, {
        onConflict: 'wallet_address'
      });

    if (error) {
      console.error('❌ Error guardando en DB:', error);
      return new Response(JSON.stringify({ error: 'Database error', details: error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Usuario rechazado guardado en DB');
  } else {
    console.warn('⚠️ reviewAnswer desconocido:', reviewResult?.reviewAnswer);
  }

  return new Response(JSON.stringify({
    received: true,
    status: reviewResult?.reviewAnswer
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

