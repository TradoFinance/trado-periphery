const {getContractJson} = require('../funcs')
const { ethers } = require("hardhat");

async function getBalance(tokenList, weth, user) {
    const balance = []
    for (const token of tokenList) {
        if (token.address.toLowerCase() !== weth.address.toLowerCase()) {
            const val = await token.balanceOf(user);
            balance.push(val.toString())
        } else {
            const result = await ethers.provider.getBalance(user)
            balance.push(result.toString())
        }
    }
    return balance;
}

async function getToken(name, symbol, decimal) {

    // deploy token
    const tokenFactory = await ethers.getContractFactory("TestToken")
    token = await tokenFactory.deploy(name, symbol, decimal);
    await token.deployed();
    
    return token;
}


async function getWETH9(signer) {
    var WETH9Json = getContractJson(__dirname + '/../core/WETH9.json');
    var WETH9Factory = await ethers.getContractFactory(WETH9Json.abi, WETH9Json.bytecode, signer);
    var WETH9 = await WETH9Factory.deploy();
    await WETH9.deployed();
    return WETH9;
}

module.exports ={
    getBalance,
    getToken,
    getWETH9,
}