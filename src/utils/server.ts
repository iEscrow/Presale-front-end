import { ethers } from 'ethers';

export const KYC_CONFIG = {
  development: {
    VERIFIER_PRIVATE_KEY: process.env.HARDHAT_KYC_VERIFIER_KEY!, // Account #2
    CHAIN_ID: 31337, // Hardhat
    SIMPLE_KYC_ADDRESS: process.env.NEXT_PUBLIC_SIMPLE_KYC_ADDRESS! // Address del contrato en Hardhat
  },
  production: {
    VERIFIER_PRIVATE_KEY: process.env.PROD_KYC_VERIFIER_KEY!, // Wallet dedicada
    CHAIN_ID: 1, // Mainnet
    SIMPLE_KYC_ADDRESS: process.env.NEXT_PUBLIC_SIMPLE_KYC_ADDRESS! // Address en Mainnet
  }
};

const env = process.env.NEXT_PUBLIC_ENVIRONMENT as 'development' | 'production';

export const currentConfig = KYC_CONFIG[env];

export async function generateEIP712Signature(walletAddress: string) {

  const nonce = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  const expiry = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  
  const domain = {
    name: "KYCVerification",
    version: "1",
    chainId: currentConfig.CHAIN_ID, // ← 31337 o 1
    verifyingContract: currentConfig.SIMPLE_KYC_ADDRESS // ← Address según env
  };
  
  const types = {
    KYCVerification: [
      { name: "user", type: "address" },
      { name: "verified", type: "bool" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" }
    ]
  };
  
  const value = {
    user: walletAddress,
    verified: true,
    nonce: nonce.toString(),
    expiry: expiry
  };
  
  const backendWallet = new ethers.Wallet(currentConfig.VERIFIER_PRIVATE_KEY);
  const signature = await backendWallet.signTypedData(domain, types, value);
  
  console.log(`✅ Firma generada para ${walletAddress} en ${process.env.ENVIRONMENT}`);
  
  return { signature, nonce, expiry };
}