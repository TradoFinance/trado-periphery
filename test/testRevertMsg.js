
const { BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("test uniswap price oracle", function () {
    let test;
    beforeEach(async function() {
      
        [signer] = await ethers.getSigners();

        const factory = await ethers.getContractFactory("TestRevertMsg");
        test = await factory.deploy();
    });
    
    it("test revert", async function () {
        const data = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
        try {
            await test.revertErrorData(data)
        } catch (err) {
            console.log('err: ', err)
        }
    });
});