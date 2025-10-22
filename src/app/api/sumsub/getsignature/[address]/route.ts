import { NextRequest } from "next/server";
import { createClient } from "@/utils/database";
import { ethers } from 'ethers';
import { ABIS } from "@/utils/utils";

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
  
  let onChainVerified = false;
  let onChainExpiry = 0;
  let currentNonce = 0;
  
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'
        ? 'http://127.0.0.1:8545'
        : process.env.ALCHEMY_RPC_URL
    );

    console.log(provider)
    
    const kycContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_KYCVERIFICATION_ADDRESS!,
      ABIS.KYCVERIFICATION,
      provider
    );
    
    onChainVerified = await kycContract.isCurrentlyVerified(address);
    onChainExpiry = Number(await kycContract.kycExpiry(address));
    currentNonce = Number(await kycContract.nonces(address));
    
    // Si ya está verificado on-chain, devolver eso directamente
    if (onChainVerified) {
      return Response.json({
        status: 'approved',
        hasSignature: false, // Ya no necesita la firma
        onChain: true,
        expiry: onChainExpiry,
        message: 'Already verified on-chain'
      });
    }
  } catch (error) {
    console.error('⚠️ Error checking on-chain status:', error);
    // Continuar con DB check si falla on-chain
  }
  
  // Consultar DB para firma pendiente
  const { data: kyc, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('wallet_address', address)
    .single();

  console.log('KYC from DB:', kyc);
  
  if (error && error.code !== 'PGRST116') {
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
      currentNonce,
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
    
    // Verificar que el nonce de la firma coincida con el esperado
    const expectedNonce = currentNonce + 1;
    if (kyc.nonce !== expectedNonce) {
      console.warn('⚠️ Nonce mismatch:', {
        dbNonce: kyc.nonce,
        expectedNonce,
        currentOnChain: currentNonce
      });
      
      return Response.json({
        status: 'nonce_mismatch',
        hasSignature: false,
        message: 'Nonce mismatch - signature invalid',
        details: {
          dbNonce: kyc.nonce,
          expectedNonce,
          currentNonce
        }
      });
    }
    
    return Response.json({
      status: 'approved',
      hasSignature: true,
      signature: kyc.signature,
      nonce: kyc.nonce.toString(),
      expiry: kyc.expiry,
      verified: true, // Añadir este campo
      currentNonce,
      message: 'Ready to verify on-chain'
    });
  }
  
  return Response.json({
    status: 'unknown',
    hasSignature: false,
    currentNonce,
    message: 'Unexpected state'
  });
}