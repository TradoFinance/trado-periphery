const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = require('bignumber.js');
const { createPool, mint, getNFTLiquidityManager, setApprovalForAll, ownerOf } = require("./liquidityManager.js");
const { getToken, getBalance, getWETH9 } = require("./tokens.js");
const { getPoolParts, getIzumiswapFactory} = require('../funcs')
const { getSwap, swapPointDown, swapPointUp } = require('./swap');
const { getLocker, deposit, collectAll, withdraw } = require("./locker.js");
const { checkContains, checkStrVecEqual, checkStrLT, checkStrVecGT } = require("./check.js");

describe("locker", function () {
    var signer, miner1, miner2, miner3, trader;
    var izumiswapFactory;
    var weth9;
    var nflm;
    var swap;
    var locker;
    var tokenA, tokenB;
    var lockTime;
    var txnNumber;

    beforeEach(async function() {
        [signer, miner1, miner2, miner3, trader] = await ethers.getSigners();
        const {swapX2YModule, swapY2XModule, liquidityModule, limitOrderModule, flashModule} = await getPoolParts();
        izumiswapFactory = await getIzumiswapFactory(signer.address, swapX2YModule, swapY2XModule, liquidityModule, limitOrderModule, flashModule, signer);
        console.log("get izumiswapFactory");
        weth9 = await getWETH9(signer);
        console.log("get weth9");
        nflm = await getNFTLiquidityManager(izumiswapFactory.address, weth9.address);
        console.log("get nflm");
        swap = await getSwap(izumiswapFactory.address, weth9.address);
        lockTime = 7*24*60*60;
        locker = await getLocker(nflm.address, 100)
        
        tokenA = await getToken('a', 'a', 18)
        tokenB = await getToken('b', 'b', 18)
        console.log(tokenA.address)
        
        const aBigNumeber = '10000000000000000000000000000'
        txnNumber=  '100000000000000000000'
        const wethDepositNumber = '1000000000000000000000'
    
        await tokenA.mint(miner1.address, aBigNumeber);
        await tokenB.mint(miner1.address, aBigNumeber);
        await tokenA.connect(miner1).approve(nflm.address, aBigNumeber);
        await tokenB.connect(miner1).approve(nflm.address, aBigNumeber);
        await weth9.connect(miner1).approve(nflm.address, aBigNumeber);
        
        await tokenA.mint(miner2.address, aBigNumeber);
        await tokenB.mint(miner2.address, aBigNumeber);
        await tokenA.connect(miner2).approve(nflm.address, aBigNumeber);
        await tokenB.connect(miner2).approve(nflm.address, aBigNumeber);
        await weth9.connect(miner2).approve(nflm.address, aBigNumeber);
        
        await tokenA.mint(trader.address, aBigNumeber);
        await tokenB.mint(trader.address, aBigNumeber);
        await tokenA.connect(trader).approve(swap.address, aBigNumeber);
        await tokenB.connect(trader).approve(swap.address, aBigNumeber);
        await weth9.connect(trader).approve(swap.address, aBigNumeber);

        await createPool(nflm, tokenA.address, tokenB.address, 3000, 1000)
        await createPool(nflm, weth9.address, tokenB.address, 3000, 2000)

        await weth9.connect(miner1).deposit({value: wethDepositNumber})
        await weth9.connect(miner2).deposit({value: wethDepositNumber})
        await weth9.connect(trader).deposit({value: wethDepositNumber})
        await mint(nflm, miner1, tokenA.address, tokenB.address, 3000, -6000, 8000, txnNumber, txnNumber)
        await mint(nflm, miner2, tokenA.address, tokenB.address, 3000, -6000, 8000, txnNumber, txnNumber)
        await mint(nflm, miner1, weth9.address, tokenB.address, 3000, -6000, 8000, txnNumber, txnNumber)
        await mint(nflm, miner2, weth9.address, tokenB.address, 3000, -6000, 8000, txnNumber, txnNumber)

        await setApprovalForAll(nflm, miner1, locker.address)
        await setApprovalForAll(nflm, miner2, locker.address)
        
    });

    it("check deposit", async function() {
        // now deposit
        result = await deposit(locker, miner1, '0', lockTime)
        expect(result.ok).to.equal(true)
        result = await deposit(locker, miner2, '1', lockTime * 2)
        expect(result.ok).to.equal(true)
        result = await deposit(locker, miner1, '2', lockTime * 3)
        expect(result.ok).to.equal(true)
        result = await deposit(locker, miner2, '3', lockTime * 4)
        expect(result.ok).to.equal(true)

        expect(await ownerOf(nflm, '0')).to.equal(locker.address);
        expect(await ownerOf(nflm, '1')).to.equal(locker.address);
        expect(await ownerOf(nflm, '2')).to.equal(locker.address);
        expect(await ownerOf(nflm, '3')).to.equal(locker.address);

        const blockNumStart = await ethers.provider.getBlockNumber();
        const blockStart = await ethers.provider.getBlock(blockNumStart);
        const timeStart = blockStart.timestamp;

        // no fees, collect fee
        const tokenList = [tokenA, tokenB, weth9]
        result = await collectAll(locker, miner1, tokenList, weth9)
        checkStrVecEqual(result.delta.slice(0, 2), ['0', '0'])
        checkStrLT(result.delta[2], '0')
        result = await collectAll(locker, miner2, tokenList, weth9)
        checkStrVecEqual(result.delta.slice(0, 2), ['0', '0'])
        checkStrLT(result.delta[2], '0')

        // swap
        await swapPointDown(swap, trader, tokenA.address, tokenB.address, 3000, -6000, txnNumber)
        await swapPointUp(swap, trader, tokenA.address, tokenB.address, 3000, 8000, txnNumber)
        await swapPointDown(swap, trader, weth9.address, tokenB.address, 3000, -6000, txnNumber)
        await swapPointUp(swap, trader, weth9.address, tokenB.address, 3000, 8000, txnNumber)

        // collect all
        result = await collectAll(locker, miner1, tokenList, weth9)
        checkStrVecGT(result.delta, ['0','0', '0'])
        result = await collectAll(locker, miner2, tokenList, weth9)
        checkStrVecGT(result.delta, ['0','0', '0'])
        
        // withdraw to early
        result = await withdraw(locker, miner1, '0')
        expect(result.ok).to.equal(false)
        checkContains(result.errMsg, "NOT TIME YET")

        await ethers.provider.send('evm_setNextBlockTimestamp', [timeStart + 10 * lockTime]); 

        // try to withdraw others
        result = await withdraw(locker, miner1, '1')
        expect(result.ok).to.equal(false)
        checkContains(result.errMsg, "NOT OWNER OR NOT EXIST")

        result = await withdraw(locker, miner2, '2')
        expect(result.ok).to.equal(false)
        checkContains(result.errMsg, "NOT OWNER OR NOT EXIST")
        // withdraw success
        result = await withdraw(locker, miner1, '0')
        expect(result.ok).to.equal(true)
        expect(await ownerOf(nflm, '0')).to.equal(miner1.address);
        result = await withdraw(locker, miner2, '1')
        expect(result.ok).to.equal(true)
        expect(await ownerOf(nflm, '1')).to.equal(miner2.address);
        result = await withdraw(locker, miner1, '2')
        expect(result.ok).to.equal(true)
        expect(await ownerOf(nflm, '2')).to.equal(miner1.address);
        result = await withdraw(locker, miner2, '3')
        expect(result.ok).to.equal(true)
        expect(await ownerOf(nflm, '3')).to.equal(miner2.address);

    });

});