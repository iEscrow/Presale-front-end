import { NextRequest } from "next/server";
import { createClient } from "@/utils/database";
import { ethers } from 'ethers';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = await params;

  console.log(address)
  
  // Validar que sea una address válida
  if (!ethers.isAddress(address)) {
    return Response.json({ 
      error: 'Invalid Ethereum address' 
    }, { 
      status: 400 
    });
  }
  
  const supabase = await createClient();
  
  if (!supabase) {
    console.error('❌ Error creando cliente de Supabase');
    return Response.json({ 
      error: 'Database connection failed' 
    }, { 
      status: 500 
    });
  }
  
  // Buscar en database
  const { data: kyc, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('wallet_address', address)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found (no es error)
    console.error('❌ Error consultando DB:', error);
    return Response.json({ 
      error: 'Database query failed',
      details: error 
    }, { 
      status: 500 
    });
  }
  
  // No existe registro
  if (!kyc) {
    return Response.json({
      status: 'not_started',
      hasSignature: false,
      message: 'KYC verification not started'
    });
  }
  
  // KYC rechazado
  if (kyc.kyc_status === 'rejected') {
    return Response.json({
      status: 'rejected',
      hasSignature: false,
      message: 'KYC verification was rejected'
    });
  }
  
  // KYC aprobado con firma
  if (kyc.kyc_status === 'approved' && kyc.signature) {
    // Verificar que no haya expirado
    const now = Math.floor(Date.now() / 1000);
    const isExpired = kyc.expiry && kyc.expiry < now;
    
    if (isExpired) {
      return Response.json({
        status: 'expired',
        hasSignature: false,
        message: 'Signature expired - contact support'
      });
    }
    
    return Response.json({
      status: 'approved',
      hasSignature: true,
      signature: kyc.signature,
      nonce: kyc.nonce?.toString(), // Convertir BigInt a string
      expiry: kyc.expiry,
      message: 'Ready to verify on-chain'
    });
  }
  
  // Estado inesperado
  return Response.json({
    status: 'unknown',
    hasSignature: false,
    message: 'Unexpected state'
  });
}