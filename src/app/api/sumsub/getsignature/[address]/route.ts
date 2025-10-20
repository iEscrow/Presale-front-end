import { NextRequest } from "next/server";
import { createClient } from "@/utils/database";
import { ethers } from 'ethers';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = await params;
  
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
  
  const { data: kyc, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('wallet_address', address)
    .single();

  console.log(kyc)
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found (no es error)
    console.error('❌ Error consultando DB:', error);
    return Response.json({ 
      error: 'Database query failed',
      details: error 
    }, { 
      status: 500 
    });
  }
  
  if (!kyc) {
    return Response.json({
      status: 'not_started',
      hasSignature: false,
      message: 'KYC verification not started'
    });
  }
  
  if (kyc.kyc_status === 'rejected') {
    return Response.json({
      status: 'rejected',
      hasSignature: false,
      message: 'KYC verification was rejected'
    });
  }
  
  if (kyc.kyc_status === 'approved' && kyc.signature) {
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
      nonce: kyc.nonce?.toString(),
      expiry: kyc.expiry,
      message: 'Ready to verify on-chain'
    });
  }
  
  return Response.json({
    status: 'unknown',
    hasSignature: false,
    message: 'Unexpected state'
  });
}