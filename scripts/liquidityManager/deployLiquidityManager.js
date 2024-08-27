const { ethers } = require("hardhat");
const deployed = require('../deployed.js');

/*

example: 

HARDHAT_NETWORK='tradoTest' node scripts/nftLiquidityManager/deployNFLM.js

*/

const net = process.env.HARDHAT_NETWORK
const v = process.argv
const weth = v[2]

async function main() {
    // deploy nft
    const LiquidityManager = await ethers.getContractFactory("LiquidityManager");
    const TradoSwapFactory = deployed[net].TradoSwapFactory;
    nflm = await LiquidityManager.deploy(TradoSwapFactory, weth);
    console.log("LiquidityManager: ", nflm.address);
    await nflm.deployed();
}

main().then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
})