import { ethers } from 'ethers';
import { ABIS } from './utils';

export const KYC_CONFIG = {
  development: {
    VERIFIER_PRIVATE_KEY: process.env.HARDHAT_KYC_VERIFIER_KEY!, // Account #2
    CHAIN_ID: 31337, // Hardhat
    KYCVERIFICATION_ADDRESS: process.env.NEXT_PUBLIC_KYCVERIFICATION_ADDRESS! // Address del contrato en Hardhat
  },
  production: {
    VERIFIER_PRIVATE_KEY: process.env.PROD_KYC_VERIFIER_KEY!, // Wallet dedicada
    CHAIN_ID: 1, // Mainnet
    KYCVERIFICATION_ADDRESS: process.env.NEXT_PUBLIC_KYCVERIFICATION_ADDRESS! // Address en Mainnet
  }
};

const env = process.env.NEXT_PUBLIC_ENVIRONMENT as 'development' | 'production';

export const currentConfig = KYC_CONFIG[env];
export async function generateEIP712Signature(walletAddress: string) {
  let currentNonce = 0;

  try {
    const providerUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'
      ? 'http://127.0.0.1:8545'
      : process.env.ALCHEMY_RPC_URL;

    const provider = new ethers.JsonRpcProvider(providerUrl);

    const network = await provider.getNetwork();

    const kycContract = new ethers.Contract(
      currentConfig.KYCVERIFICATION_ADDRESS,
      ABIS.KYCVERIFICATION,
      provider
    );

    currentNonce = Number(await kycContract.nonces(walletAddress));
  } catch (error) {
    console.error('❌ Error reading nonce from contract:', error);
    throw new Error('Failed to read nonce from blockchain');
  }

  const nonce = currentNonce + 1;

  const expiry = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

  const domain = {
    name: "KYCVerification",
    version: "1",
    chainId: currentConfig.CHAIN_ID,
    verifyingContract: currentConfig.KYCVERIFICATION_ADDRESS
  };

  const types = {
    KYCData: [
      { name: "user", type: "address" },
      { name: "verified", type: "bool" },
      { name: "expiryTimestamp", type: "uint256" },
      { name: "nonce", type: "uint256" }
    ]
  };

  const value = {
    user: walletAddress,
    verified: true,
    expiryTimestamp: expiry,
    nonce: nonce
  };

  const backendWallet = new ethers.Wallet(currentConfig.VERIFIER_PRIVATE_KEY);
  const signature = await backendWallet.signTypedData(domain, types, value);

  console.log(`✅ Firma EIP712 generada para ${walletAddress}`);
  console.log(`   Nonce: ${nonce} (on-chain actual: ${currentNonce})`);
  console.log(`   Expiry: ${expiry} (${new Date(expiry * 1000).toISOString()})`);
  console.log(`   Signature: ${signature}`);

  return { signature, nonce, expiry };
}
