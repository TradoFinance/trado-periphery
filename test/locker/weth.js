
async function depositWETH(weth, user, amount) {

    await weth.connect(user).deposit({value: amount})
    
}

module.exports = {
    depositWETH,
}