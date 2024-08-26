const { default: BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const hardhat = require('hardhat');
const { ethers } = require("hardhat");

function checkContains(str, substr) {
    expect(String(str).search(substr) !== -1).to.equal(true);
}

function checkStrVecEqual(vec1, vec2) {
    expect(vec1.length).to.equal(vec2.length)
    for (let i = 0; i < vec1.length; i ++) {
        const v1 = vec1[i];
        const v2 = vec2[i];
        expect(v1).to.equal(v2)
    }
}

function checkStrGT(a, b) {
    return expect(new BigNumber(a).gt(b)).to.equal(true)
}

function checkStrLT(a, b) {
    return expect(new BigNumber(a).lt(b)).to.equal(true)
}

function checkStrVecGT(a, b) {
    for (let i = 0; i < a.length; i ++) {
        expect(new BigNumber(a[i]).gt(b[i])).to.equal(true)
    }
}
function checkStrVecLT(a, b) {
    for (let i = 0; i < a.length; i ++) {
        expect(new BigNumber(a[i]).lt(b[i])).to.equal(true)
    }
}

module.exports = {
    checkContains,
    checkStrVecEqual,
    checkStrGT,
    checkStrLT,
    checkStrVecGT,
    checkStrVecLT,
}