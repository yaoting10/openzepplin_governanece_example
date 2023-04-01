import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import fs from "fs";
const privateKey = fs.readFileSync("secretDir/.secret_test").toString().trim();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan:{
    apiKey: {
      goerli: "V8HYP4GX4R4EZB161G57TJK9XXN9TF5H7N"
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks:{
    hardhat: {
      chainId: 31337
    },
    localhost: {
      chainId: 31337
    },
    goerli: {
      chainId: 5,
      url: "https://goerli.infura.io/v3/68f1ff6b990e4934b4be094603fae80e",
      accounts: [privateKey],
      gasPrice: 253500000000
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }
};

export default config;
