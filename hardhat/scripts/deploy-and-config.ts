import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=".repeat(60));
  console.log("DEPLOYING UNITY TOKEN PRESALE");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\n📍 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // ============ STEP 1: Deploy Unity Token ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: Deploying UnityFinance Token");
  console.log("=".repeat(60));
  
  const UnityFinance = await ethers.getContractFactory("UnityFinance");
  const unityToken = await UnityFinance.deploy();
  await unityToken.waitForDeployment();
  const unityTokenAddress = await unityToken.getAddress();
  
  console.log("✅ UnityFinance Token deployed to:", unityTokenAddress);
  console.log("   Name:", await unityToken.name());
  console.log("   Symbol:", await unityToken.symbol());
  console.log("   Total Supply:", ethers.formatEther(await unityToken.totalSupply()));

  // ============ STEP 2: Deploy Presale Contract ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Deploying MultiTokenPresale Contract");
  console.log("=".repeat(60));

  // Presale parameters
  const presaleRate = ethers.parseEther("666.666666666666666"); // 666.666... tokens per USD
  const maxTokensToMint = ethers.parseEther("5000000000"); // 5 billion tokens for presale
  
  const MultiTokenPresale = await ethers.getContractFactory("MultiTokenPresale");
  const presale = await MultiTokenPresale.deploy(
    unityTokenAddress,
    presaleRate,
    maxTokensToMint
  );
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  
  console.log("✅ Presale Contract deployed to:", presaleAddress);
  console.log("   Presale Rate:", ethers.formatEther(presaleRate), "tokens per USD");
  console.log("   Max Tokens:", ethers.formatEther(maxTokensToMint));

  // ============ STEP 3: Whitelist Presale Contract ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: Whitelisting Presale Contract (no burn on transfers)");
  console.log("=".repeat(60));

  const whitelistTx = await unityToken.enableWhitelist(presaleAddress);
  await whitelistTx.wait();
  console.log("✅ Presale contract whitelisted");

  // ============ STEP 4: Fund Presale Contract ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 4: Funding Presale Contract");
  console.log("=".repeat(60));

  const transferTx = await unityToken.transfer(presaleAddress, maxTokensToMint);
  await transferTx.wait();
  
  const presaleBalance = await unityToken.balanceOf(presaleAddress);
  console.log("✅ Transferred", ethers.formatEther(presaleBalance), "tokens to presale");

  // ============ STEP 5: Start Presale ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 5: Starting Presale");
  console.log("=".repeat(60));

  const duration = 30 * 24 * 60 * 60; // 30 days
  const startTx = await presale.startPresale(duration);
  await startTx.wait();
  
  const presaleStatus = await presale.getPresaleStatus();
  console.log("✅ Presale started!");
  console.log("   Duration: 30 days");
  console.log("   Start Time:", new Date(Number(presaleStatus.startTime) * 1000).toISOString());
  console.log("   End Time:", new Date(Number(presaleStatus.endTime) * 1000).toISOString());

  // ============ STEP 6: Verify Token Addresses (Fork) ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 6: Verifying Mainnet Token Addresses");
  console.log("=".repeat(60));

  const tokens = {
    NATIVE: "0x0000000000000000000000000000000000000000",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  };

  for (const [name, address] of Object.entries(tokens)) {
    if (address === tokens.NATIVE) {
      console.log(`✅ ${name.padEnd(6)} (Native ETH)`);
    } else {
      const code = await ethers.provider.getCode(address);
      if (code !== "0x") {
        console.log(`✅ ${name.padEnd(6)} exists at ${address}`);
      } else {
        console.log(`❌ ${name.padEnd(6)} NOT FOUND at ${address}`);
      }
    }
  }

  // ============ STEP 7: Get Supported Tokens Info ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 7: Supported Payment Tokens Configuration");
  console.log("=".repeat(60));

  const supportedTokens = await presale.getSupportedTokens();
  
  for (let i = 0; i < supportedTokens.tokens.length; i++) {
    const priceUSD = Number(supportedTokens.prices[i]) / 1e8;
    const maxUSD = Number(supportedTokens.maxPurchases[i]) / 1e8;
    const active = supportedTokens.active[i];
    
    console.log(`\n${supportedTokens.symbols[i]}:`);
    console.log(`  Address: ${supportedTokens.tokens[i]}`);
    console.log(`  Price: $${priceUSD.toLocaleString()}`);
    console.log(`  Max per user: $${maxUSD.toLocaleString()}`);
    console.log(`  Active: ${active ? "✅" : "❌"}`);
  }

  // ============ STEP 8: Save Deployment Info ============
  console.log("\n" + "=".repeat(60));
  console.log("STEP 8: Saving Deployment Information");
  console.log("=".repeat(60));

  const deploymentInfo = {
    network: "hardhat-fork",
    chainId: 1,
    blockNumber: 23379969,
    timestamp: new Date().toISOString(),
    contracts: {
      unityToken: unityTokenAddress,
      presale: presaleAddress,
    },
    tokens: {
      NATIVE: tokens.NATIVE,
      WETH: tokens.WETH,
      USDC: tokens.USDC,
      USDT: tokens.USDT,
      LINK: tokens.LINK,
      WBTC: tokens.WBTC,
    },
    presaleConfig: {
      rate: presaleRate.toString(),
      maxTokens: maxTokensToMint.toString(),
      duration: duration,
      startTime: presaleStatus.startTime.toString(),
      endTime: presaleStatus.endTime.toString(),
    },
    accounts: {
      deployer: deployer.address,
    },
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to deployment.json");

  // ============ FINAL SUMMARY ============
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\n📝 Contract Addresses:");
  console.log("   Unity Token:", unityTokenAddress);
  console.log("   Presale:", presaleAddress);
  console.log("\n🔗 RPC URL: http://127.0.0.1:8545");
  console.log("📊 Network: Ethereum Mainnet Fork");
  console.log("\n💡 Next Steps:");
  console.log("   1. Connect your frontend to http://127.0.0.1:8545");
  console.log("   2. Use the contract addresses above");
  console.log("   3. Payment tokens (WETH, USDC, etc.) are at their real mainnet addresses");
  console.log("   4. Test purchases with the provided accounts");
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });