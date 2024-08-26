const { stringMinusVec } = require("./calc");
const { getBalance } = require("./tokens");


async function getLocker(nflm, maxCnt) {
    const Locker = await ethers.getContractFactory("Locker");
    var locker = await Locker.deploy(nflm, maxCnt);
    await locker.deployed();
    return locker;
}

async function deposit(locker, user, nftId, lockTime) {
    let ok = true;
    let errMsg = undefined;
    try {
        await locker.connect(user).lock(nftId, lockTime);
    } catch(err) {
        ok = false;
        errMsg = err.message;
    }
    return {ok, errMsg}
}

async function collect(locker, user, nftId, tokenList, weth) {
    let ok = true;
    let errMsg = undefined;
    const balanceBefore = await getBalance(tokenList, weth, user.address)
    try {
        await locker.connect(user).collect(nftId);
    } catch(err) {
        ok = false;
        errMsg = err.message;
    }
    const balanceAfter = await getBalance(tokenList, weth, user.address)
    const delta = stringMinusVec(balanceAfter, balanceBefore)
    return {ok, errMsg, delta}
}

async function collectAll(locker, user, tokenList, weth) {
    let ok = true;
    let errMsg = undefined;
    const balanceBefore = await getBalance(tokenList, weth, user.address)
    try {
        await locker.connect(user).collectAll();
    } catch(err) {
        ok = false;
        errMsg = err.message;
    }
    const balanceAfter = await getBalance(tokenList, weth, user.address)
    const delta = stringMinusVec(balanceAfter, balanceBefore)
    return {ok, errMsg, delta}
}

async function withdraw(locker, user, nftId) {
    let ok = true;
    let errMsg = undefined;
    try {
        await locker.connect(user).withdraw(nftId);
    } catch(err) {
        ok = false;
        errMsg = err.message;
    }
    return {ok, errMsg}
}

async function adminWithdraw(locker, admin, nftId) {
    let ok = true;
    let errMsg = undefined;
    try {
        await locker.connect(admin).adminWithdraw(nftId);
    } catch(err) {
        ok = false;
        errMsg = err.message;
    }
    return {ok, errMsg}
}

async function adminSetMaxCnt(locker, admin, maxCnt) {
    let ok = true;
    let errMsg = undefined;
    try {
        await locker.connect(admin).setMaxCnt(maxCnt);
    } catch(err) {
        ok = false;
        errMsg = err.message;
    }
    return {ok, errMsg}
}

async function getMaxCnt(locker) {
    const maxCnt = await locker.maxCnt()
    return maxCnt.toString()
}

module.exports ={
    getLocker,
    deposit,
    collect,
    collectAll,
    withdraw,
    adminWithdraw,
    adminSetMaxCnt,
    getMaxCnt,
}