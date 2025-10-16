import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { whales } from "../utils";

async function main() {

  try {
    console.log("=".repeat(60));
    console.log("DEPLOYING UNITY TOKEN PRESALE");
    console.log("=".repeat(60));

    const [deployer, testAccount] = await ethers.getSigners();
    console.log("\nDeploying with:", deployer.address);
    console.log("Test account:", testAccount.address);

    // ============ Deploy Unity Token ============
    console.log("\n[1/7] Deploying UnityFinance Token...");
    const UnityFinance = await ethers.getContractFactory("UnityFinance");
    const unityToken = await UnityFinance.deploy();
    await unityToken.waitForDeployment();
    const unityTokenAddress = await unityToken.getAddress();
    console.log("✓ Unity Token:", unityTokenAddress);

    // ============ Deploy Presale Contract ============
    console.log("\n[2/7] Deploying Presale Contract...");
    const presaleRate = ethers.parseEther("666.666666666666666");
    const maxTokensToMint = ethers.parseEther("5000000000");

    const MultiTokenPresale = await ethers.getContractFactory("MultiTokenPresale");
    const presale = await MultiTokenPresale.deploy(
      unityTokenAddress,
      presaleRate,
      maxTokensToMint
    );
    await presale.waitForDeployment();
    const presaleAddress = await presale.getAddress();
    console.log("✓ Presale Contract:", presaleAddress);

    // ============ Whitelist & Fund Presale ============
    console.log("\n[3/7] Configuring Presale...");
    await (await unityToken.enableWhitelist(presaleAddress)).wait();
    await (await unityToken.transfer(presaleAddress, maxTokensToMint)).wait();
    console.log("✓ Presale funded with 5B tokens");

    // ============ Start Presale ============
    console.log("\n[4/7] Starting Presale (30 days)...");
    const duration = 30 * 24 * 60 * 60;
    await (await presale.startPresale(duration)).wait();
    console.log("✓ Presale active");

    // ============ Fund Test Account with Tokens ============
    console.log("\n[5/7] Funding test account with tokens from whales...");


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

      await tokenContract.connect(whaleSigner).transfer(testAccount.address, amount);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [config.address]);

      console.log(`✓ ${name}: ${config.amount} transferred`);
    }

    // ============ Verify Balances ============
    console.log("\n[6/7] Verifying test account balances...");

    const balances: any = {};
    for (const [name, config] of Object.entries(whales)) {
      const tokenContract = await ethers.getContractAt("IERC20", config.token);
      const balance = await tokenContract.balanceOf(testAccount.address);
      balances[name] = ethers.formatUnits(balance, config.decimals);
      console.log(`  ${name}: ${balances[name]}`);
    }

    const ethBalance = await ethers.provider.getBalance(testAccount.address);
    console.log(`  ETH: ${ethers.formatEther(ethBalance)}`);

    // ============ Save Deployment Info ============
    console.log("\n[7/7] Saving deployment info...");

    const deploymentInfo = {
      network: "hardhat-fork",
      timestamp: new Date().toISOString(),
      contracts: {
        unityToken: unityTokenAddress,
        presale: presaleAddress,
      },
      tokens: {
        USDC: whales.USDC.token,
        USDT: whales.USDT.token,
        WETH: whales.WETH.token,
        LINK: whales.LINK.token,
        WBTC: whales.WBTC.token,
      },
      testAccount: {
        address: testAccount.address,
        balances: balances
      },
      presaleConfig: {
        rate: "666.666666666666666 tokens per USD",
        maxTokens: "5,000,000,000",
        duration: "30 days"
      }
    };

    const deploymentPath = path.join(__dirname, "../deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✓ Saved to deployment.json");

    // ============ Increasing Time to check presale end claim rewards ================
    if (process.env.END_PRESALE === "true") {
      console.log("\n[8/7] Making test purchases, increasing EVM time and ending presale...");

      // Aprobar USDC para el presale
      const usdcContract = await ethers.getContractAt("IERC20", whales.USDC.token);
      const purchaseAmount = ethers.parseUnits("100", whales.USDC.decimals); // 100 USDC

      await (await usdcContract.connect(testAccount).approve(presaleAddress, purchaseAmount)).wait();

      // Comprar tokens con USDC
      await (await presale.connect(testAccount).buyWithToken(
        whales.USDC.token,
        purchaseAmount,
        testAccount.address
      )).wait();
      console.log("✓ Purchased tokens with 100 USDC");

      console.log("\n[8/7] Ending presale and increasing time by 31 days...");
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
    console.log("  Unity Token:", unityTokenAddress);
    console.log("  Presale:", presaleAddress);
    console.log("\nTest Account:", testAccount.address);
    console.log("  Ready to test purchases with funded tokens");
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