require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '../backend/.env' });

const rawPrivateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
const normalizedPrivateKey = rawPrivateKey
  ? (rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`)
  : null;
const rawBscRpcUrl = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
const normalizedBscRpcUrl = /^https?:\/\//.test(rawBscRpcUrl)
  ? rawBscRpcUrl
  : `https://${rawBscRpcUrl}`;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bsc: {
      url: normalizedBscRpcUrl,
      accounts: normalizedPrivateKey ? [normalizedPrivateKey] : [],
      chainId: 56
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: normalizedPrivateKey ? [normalizedPrivateKey] : [],
      chainId: 97
    }
  }
};
