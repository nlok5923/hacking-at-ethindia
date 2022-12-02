
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan"
import "hardhat-gas-reporter"

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });


export default {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "goerli",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: process.env.MUMBAI_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
      
  },
  goerli: {
    url: `https://goerli.infura.io/v3/be456f1154af4971877c7c52dd5a612a`,
    accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
  }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
 }
};