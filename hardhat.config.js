require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('hardhat-contract-sizer');
require('@openzeppelin/hardhat-upgrades');

const fs = require("fs");

const DEBUG = false;

/// Tasks

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  console.log('Hardhat Node Accounts');
  for (const account of accounts) {
    console.log(account.address);
  }
});

// Task to generate a wallet with a randomly created mnemonic
task("generate", "Create a mnemonic for builder deploys", async () => {

  const newWallet = hre.ethers.Wallet.createRandom();
  const mnemonic = newWallet.mnemonic.phrase;
  console.log(mnemonic);
  const address = newWallet.address;

  console.log("🔐 Account Generated as " + address + " and set as mnemonic in packages/hardhat");
  console.log("privateKey", newWallet.privateKey);

  fs.writeFileSync("./" + address + ".txt", mnemonic);
  fs.writeFileSync("./mnemonic.txt", newWallet.privateKey);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/// Configuration

// Identify RPC type in .env file
if (!process.env.INFURA_ID) {
  throw "Please set INFURA_ID in .env";
}
const mainnetUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`;

//
// Identify in .env the netowrk to interact for deployments or scripts:
//

const dnetwork = !process.env.DEFAULT_NETWORK ? "localhost" : process.env.DEFAULT_NETWORK;

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    if (dnetwork !== "localhost") {
      console.log(
        "☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`."
      );
    }
  }
  return "";
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: dnetwork,
  solidity: "0.8.13",
  networks: {
    localhost: {
      url: "http://localhost:8545/",
      timeout: 2000000,
      /*
        no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (add mnemonic() here to set the deployer locally)
      */
    },
    mainnet: {
      url: mainnetUrl,
      accounts: process.env.PRIVATE_KEY ?
        [process.env.PRIVATE_KEY] :
        { mnemonic: mnemonic() },
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: process.env.PRIVATE_KEY ?
        [process.env.PRIVATE_KEY] :
        { mnemonic: mnemonic() },
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: process.env.PRIVATE_KEY ?
        [process.env.PRIVATE_KEY] :
        { mnemonic: mnemonic() },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};