import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 23478305, // <- I made a fork from a specific block to avoid issues with tests and to allow hardhat to cache the state
        enabled: true,
      },
      chainId: 31337,
      accounts: {
        count: 5,
      },
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      loggingEnabled: true,
      gasPrice: 1,
      initialBaseFeePerGas: 1
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;
