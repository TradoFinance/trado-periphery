
async function getNFTLiquidityManager(factory, weth) {
    const LiquidityManager = await ethers.getContractFactory("LiquidityManager");
    var nflm = await LiquidityManager.deploy(factory, weth);
    await nflm.deployed();
    return nflm;
}

async function mint(nflm, miner, tokenA, tokenB, fee, pl, pr, amountA, amountB) {
    let tokenX = tokenA;
    let tokenY = tokenB;
    let amountX = amountA;
    let amountY = amountB;

    if (tokenX.toLowerCase() > tokenY.toLowerCase()) {
        let tmp = tokenX;
        tokenX = tokenY;
        tokenY = tmp;
        amountX = amountB;
        amountY = amountA;
    }

    await nflm.connect(miner).mint(
        {
            miner: miner.address,
            tokenX: tokenX,
            tokenY: tokenY,
            fee: fee,
            pl: pl,
            pr: pr,
            xLim: amountX,
            yLim: amountY,
            amountXMin: 0,
            amountYMin: 0,
            deadline: '0xffffffff'
        }
    );
}

async function ownerOf(nflm, nftId) {
    return await nflm.ownerOf(nftId)
}

async function createPool(nflm, tokenA, tokenB, fee, point) {
    if (tokenA.toLowerCase() < tokenB.toLowerCase()) {
        await nflm.createPool(tokenA, tokenB, fee, point)
    } else {
        await nflm.createPool(tokenB, tokenA, fee, point)
    }
}

async function setApprovalForAll(nflm, user, addr) {
    await nflm.connect(user).setApprovalForAll(addr, true)
}

module.exports ={
    getNFTLiquidityManager,
    mint,
    ownerOf,
    createPool,
    setApprovalForAll,
}