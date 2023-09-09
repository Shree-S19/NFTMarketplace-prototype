require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // mumbai: {
    //   url: `https://polygon-mumbai.g.alchemy.com/v2/nAhiCHKvZkhkp4A7PkkCIBON0-BXW26d`,
    //   //accounts: [process.env.privateKey]
    // },
    // matic: {
    //   url: "https://polygon-mumbai.g.alchemy.com/v2/Y_SnEVy9I8wXvOhxcp-WYMLxdfPLZE3L",
    //   //accounts: [process.env.privateKey]
    // },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/Pal9Su7gNnbZw3EQE5DvmrV_uYo5hYBK",
      accounts: [ "3b741cb66523df3f32de5d5ebc0b2232070b45ee5529957373a8c50f53322eec" ]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};