import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { whales } from "../utils";

async function main() {

  try {
    console.log("=".repeat(60));
    console.log("DEPLOYING UNITY TOKEN PRESALE");
    console.log("=".repeat(60));

    const [deployer, account1, account2, account3, account4] = await ethers.getSigners();
    console.log("\nDeploying with:", deployer.address);
    console.log("Test accounts:");
    console.log("  Account #1:", account1.address);
    console.log("  Account #2:", account2.address);
    console.log("  Account #3:", account3.address);
    console.log("  Account #4:", account4.address);

    // Array de cuentas de prueba para iterar
    const testAccounts = [
      { name: "Account #1", signer: account1 },
      { name: "Account #2", signer: account2 },
      { name: "Account #3", signer: account3 },
      { name: "Account #4", signer: account4 }
    ];

    // ============ Deploy Unity Token ============
    console.log("\n Deploying UnityFinance Token...");
    const UnityFinance = await ethers.getContractFactory("UnityFinance");
    const unityToken = await UnityFinance.deploy();
    await unityToken.waitForDeployment();
    const unityTokenAddress = await unityToken.getAddress();
    console.log("✓ Unity Token:", unityTokenAddress);

    // ============ Deploy Simple-KYC Contract ============
    console.log("\n Deploying Simple-KYC Token...");
    const KYCVerification = await ethers.getContractFactory("KYCVerification");
    const KYCVerificationContract = await KYCVerification.deploy(deployer.address);
    await KYCVerificationContract.waitForDeployment();
    const KYCVerificationAddress = await KYCVerificationContract.getAddress();
    console.log("✓ Simple-KYC:", KYCVerificationAddress);

    // ============ Deploy Presale Contract ============
    console.log("\n Deploying Presale Contract...");
    const presaleRate = ethers.parseEther("666.666666666666666");
    const maxTokensToMint = ethers.parseEther("5000000000");

    const MultiTokenPresale = await ethers.getContractFactory("MultiTokenPresale");
    const presale = await MultiTokenPresale.deploy(
      unityTokenAddress,
      presaleRate,
      maxTokensToMint,
      KYCVerificationAddress
    );
    await presale.waitForDeployment();
    const presaleAddress = await presale.getAddress();
    console.log("✓ Presale Contract:", presaleAddress);

    // ============ Whitelist & Fund Presale ============
    console.log("\n Configuring Presale...");
    await (await unityToken.enableWhitelist(presaleAddress)).wait();
    await (await unityToken.transfer(presaleAddress, maxTokensToMint)).wait();
    console.log("✓ Presale funded with 5B tokens");

    // ============ Start Presale ============
    console.log("\n Starting Presale (34 days)...");
    const days = 34
    const duration = days * 24 * 60 * 60;
    await (await presale.startPresale(duration)).wait();
    console.log("✓ Presale active");

    // ============ Fund All Test Accounts with Tokens ============
    console.log("\n Funding all test accounts with tokens from whales...");

    for (const account of testAccounts) {
      console.log(`\n--- Funding ${account.name} (${account.signer.address}) ---`);
      
      for (const [name, config] of Object.entries(whales)) {
        // Give whale ETH for gas
        await ethers.provider.send("hardhat_setBalance", [
          config.address,
          ethers.toBeHex(ethers.parseEther("10"))
        ]);

        // Impersonate whale
        await ethers.provider.send("hardhat_impersonateAccount", [config.address]);
        const whaleSigner = await ethers.getSigner(config.address);

        // Transfer tokens
        const tokenContract = await ethers.getContractAt("IERC20", config.token);
        const amount = ethers.parseUnits(config.amount, config.decimals);

        await tokenContract.connect(whaleSigner).transfer(account.signer.address, amount);

        await ethers.provider.send("hardhat_stopImpersonatingAccount", [config.address]);

        console.log(`  ✓ ${name}: ${config.amount} transferred`);
      }
    }

    // ============ Verify Balances for All Accounts ============
    console.log("\n Verifying test account balances...");

    const allBalances: any = {};
    for (const account of testAccounts) {
      console.log(`\n${account.name} (${account.signer.address}):`);
      
      const balances: any = {};
      for (const [name, config] of Object.entries(whales)) {
        const tokenContract = await ethers.getContractAt("IERC20", config.token);
        const balance = await tokenContract.balanceOf(account.signer.address);
        balances[name] = ethers.formatUnits(balance, config.decimals);
        console.log(`  ${name}: ${balances[name]}`);
      }

      const ethBalance = await ethers.provider.getBalance(account.signer.address);
      balances.ETH = ethers.formatEther(ethBalance);
      console.log(`  ETH: ${balances.ETH}`);

      allBalances[account.name] = {
        address: account.signer.address,
        balances: balances
      };
    }

    // ============ Approve KYC for All Test Accounts ============
    // console.log("\n Approving KYC for all test accounts...");

    // for (const account of testAccounts) {
    //   const user = account.signer.address;
    //   const verified = true;
    //   const currentNonce = await KYCVerificationContract.nonces(user);
    //   const nonce = currentNonce + 1n;
    //   const expiryTimestamp = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60); // 1 año

    //   // EIP712 domain and struct hash (replica de Solidity)
    //   const domain = {
    //     name: "KYCVerification",
    //     version: "1",
    //     chainId: (await ethers.provider.getNetwork()).chainId,
    //     verifyingContract: await KYCVerificationContract.getAddress(),
    //   };

    //   const types = {
    //     KYCData: [
    //       { name: "user", type: "address" },
    //       { name: "verified", type: "bool" },
    //       { name: "expiryTimestamp", type: "uint256" },
    //       { name: "nonce", type: "uint256" },
    //     ],
    //   };

    //   const value = { user, verified, expiryTimestamp, nonce };

    //   // Firma EIP712 con el signer autorizado (deployer)
    //   const signature = await deployer.signTypedData(domain, types, value);

    //   // Ejecuta verifyKYC desde la cuenta del usuario
    //   const tx = await KYCVerificationContract.connect(account.signer).verifyKYC(
    //     user,
    //     verified,
    //     expiryTimestamp,
    //     nonce,
    //     signature
    //   );
    //   await tx.wait();

    //   const status = await KYCVerificationContract.isCurrentlyVerified(user);
    //   console.log(`✓ KYC verified for ${account.name} (${user}):`, status);
    // }

    // ============ Save Deployment Info ============
    console.log("\n Saving deployment info...");

    const deploymentInfo = {
      network: "hardhat-fork",
      timestamp: new Date().toISOString(),
      contracts: {
        unityToken: unityTokenAddress,
        presale: presaleAddress,
        KYCVerification: KYCVerificationAddress
      },
      tokens: {
        USDC: whales.USDC.token,
        USDT: whales.USDT.token,
        WETH: whales.WETH.token,
        LINK: whales.LINK.token,
        WBTC: whales.WBTC.token,
        WBNB: whales.WBNB.token,
      },
      testAccounts: allBalances,
      presaleConfig: {
        rate: "666.666666666666666 tokens per USD",
        maxTokens: "5,000,000,000",
        duration: days + " days"
      }
    };

    const deploymentPath = path.join(__dirname, "../deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✓ Saved to deployment.json");

    // ============ Making Test Purchases and Ending Presale ================
    if (process.env.END_PRESALE === "true") {
      console.log("\n Making test purchases from all accounts, increasing EVM time and ending presale...");

      const usdcContract = await ethers.getContractAt("IERC20", whales.USDC.token);
      const purchaseAmount = ethers.parseUnits("100", whales.USDC.decimals); // 100 USDC

      for (const account of testAccounts) {
        console.log(`\n${account.name} purchasing...`);
        
        // Aprobar USDC para el presale
        await (await usdcContract.connect(account.signer).approve(presaleAddress, purchaseAmount)).wait();

        // Comprar tokens con USDC
        await (await presale.connect(account.signer).buyWithToken(
          whales.USDC.token,
          purchaseAmount,
          account.signer.address
        )).wait();
        console.log(`✓ ${account.name} purchased tokens with 100 USDC`);
      }

      console.log("\n Ending presale and increasing time by 31 days...");
      const timeIncrease = 31 * 24 * 60 * 60; // 31 días en segundos
      await ethers.provider.send("evm_increaseTime", [timeIncrease]);
      await ethers.provider.send("evm_mine", []); // Mina un bloque para aplicar el cambio
      await (await presale.endPresale()).wait();
      console.log("✓ Presale ended after 31 days");
    }

    // ============ Summary ============
    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log("\nContracts:");
    console.log("  Unity Token: ", unityTokenAddress);
    console.log("  Presale: ", presaleAddress);
    console.log("  SimpleKYC: ", KYCVerificationAddress);
    console.log("\nTest Accounts:");
    for (const account of testAccounts) {
      console.log(`  ${account.name}: ${account.signer.address}`);
    }
    console.log("\n  All accounts ready to test purchases with funded tokens");
    console.log("\nRPC: http://127.0.0.1:8545");
    console.log("=".repeat(60));
  } catch (err) {
    console.log(err)
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });