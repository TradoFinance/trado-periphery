const { BigNumber } = require("bignumber.js");

function stringDiv(a, b) {
    let an = new BigNumber(a);
    an = an.minus(an.mod(b));
    return an.div(b).toFixed(0, 3);
}

function stringMul(a, b) {
    let an = new BigNumber(a);
    an = an.times(b);
    return an.toFixed(0, 3);
}

function stringMinus(a, b) {
    let an = new BigNumber(a);
    an = an.minus(b);
    return an.toFixed(0, 3);
}

function stringAdd(a, b) {
    let an = new BigNumber(a);
    an = an.plus(b);
    return an.toFixed(0, 3);
}

function stringMinusVec(a, b) {
    const c = []
    for (let i = 0; i < a.length; i ++) {
        const v = stringMinus(a[i], b[i])
        c.push(v)
    }
    return c
}

module.exports = {
    stringAdd,
    stringMinus,
    stringDiv,
    stringMul,
    stringMinusVec,
}