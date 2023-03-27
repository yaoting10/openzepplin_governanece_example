import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
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
      accounts: ['0x77e32ca5a117fdf00734c4ba7e968ac61e7a0a45fb95984f4e8e0e15826791d3'],
      gasPrice: 5500000000
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }
};

export default config;
