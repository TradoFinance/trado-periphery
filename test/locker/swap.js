
async function getSwap(factory, weth) {
    const SwapManager = await ethers.getContractFactory("Swap");
    var swap = await SwapManager.deploy(factory, weth);
    await swap.deployed();
    return swap;
}

async function swapX2Y(swap, trader, tokenX, tokenY, fee, lowPt, amount) {
    await swap.connect(trader).swapX2Y(
        {
            tokenX, 
            tokenY, 
            fee,
            recipient: trader.address,
            amount,
            boundaryPt: lowPt,
            minAcquired: 0,
            maxPayed: amount,
            deadline: '0xffffffff'
        }
    );
}


async function swapY2X(swap, trader, tokenX, tokenY, fee, highPt, amount) {
    await swap.connect(trader).swapY2X(
        {
            tokenX, 
            tokenY, 
            fee,
            recipient: trader.address,
            amount,
            boundaryPt: highPt,
            minAcquired: 0,
            maxPayed: amount,
            deadline: '0xffffffff'
        }
    );
}

async function swapPointDown(swap, trader, tokenA, tokenB, fee, lowPt, amount) {
    let tokenX = tokenA;
    let tokenY = tokenB;
    if (tokenX.toLowerCase() > tokenY.toLowerCase()) {
        tokenX = tokenB;
        tokenY = tokenA;
    }
    await swapX2Y(swap, trader, tokenX, tokenY, fee, lowPt, amount)
}

async function swapPointUp(swap, trader, tokenA, tokenB, fee, highPt, amount) {
    let tokenX = tokenA;
    let tokenY = tokenB;
    if (tokenX.toLowerCase() > tokenY.toLowerCase()) {
        tokenX = tokenB;
        tokenY = tokenA;
    }
    await swapY2X(swap, trader, tokenX, tokenY, fee, highPt, amount)
}

module.exports = {
    getSwap,
    swapPointDown,
    swapPointUp,
}