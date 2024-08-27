// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import "./interfaces/ITradoSwapClassicPair.sol";
import "./interfaces/ITradoSwapClassicFactory.sol";

abstract contract TradoClassicQuoter {

    /// @notice address of tradoClassicFactory
    address public immutable tradoClassicFactory;

    /// @notice Constructor.
    /// @param _tradoClassicFactory address of TradoSwapFactory
    constructor(address _tradoClassicFactory) {
        tradoClassicFactory = _tradoClassicFactory;
    }

    function tradoClassicPair(address tokenA, address tokenB) public view returns(address) {
        return ITradoSwapClassicFactory(tradoClassicFactory).getPair(tokenA, tokenB);
    }

    function getPairState(address tokenA, address tokenB) public view returns(uint256 reserveA, uint256 reserveB, uint16 fee) {
        address pair = tradoClassicPair(tokenA, tokenB);
        uint112 reserve0;
        uint112 reserve1;
        (reserve0, reserve1, fee, ) = ITradoSwapClassicPair(pair).getPairState();
        address token0 = ITradoSwapClassicPair(pair).token0();
        (reserveA, reserveB) = (tokenA == token0) ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut, uint16 fee) internal pure returns (uint amountOut) {
        require(amountIn > 0, 'TradoSwapClassicLibrary: INSUFFICIENT_INPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'TradoSwapClassicLibrary: INSUFFICIENT_LIQUIDITY');
        uint256 amountInWithFee = amountIn * (10000 - fee);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 10000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut, uint16 fee) internal pure returns (uint amountIn) {
        require(amountOut > 0, 'TradoSwapClassicLibrary: INSUFFICIENT_OUTPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'TradoSwapClassicLibrary: INSUFFICIENT_LIQUIDITY');
        uint256 numerator = reserveIn * amountOut * 10000;
        uint256 denominator = (reserveOut - amountOut) * (10000 - fee);
        amountIn = numerator / denominator + 1;
    }

    function classicGetAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal view returns (uint256 amountOut, uint256 newReserveIn, uint256 newReserveOut) {
        (uint256 reserveIn, uint256 reserveOut, uint16 fee) = getPairState(tokenIn, tokenOut);
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut, fee);
        newReserveIn = reserveIn + amountIn;
        newReserveOut = reserveOut - amountOut;

        require(newReserveIn < type(uint112).max, "RESERVEIN OVERFLOW");
        require(newReserveOut < type(uint112).max, "RESERVEOUT OVERFLOW");
    }

    function classicGetAmountIn(
        address tokenIn,
        address tokenOut,
        uint256 amountOut
    ) internal view returns (uint256 amountIn, uint256 newReserveIn, uint256 newReserveOut) {
        (uint256 reserveIn, uint256 reserveOut, uint16 fee) = getPairState(tokenIn, tokenOut);
        amountIn = getAmountIn(amountOut, reserveIn, reserveOut, fee);
        newReserveIn = reserveIn + amountIn;
        newReserveOut = reserveOut - amountOut;

        require(newReserveIn < type(uint112).max, "RESERVEIN OVERFLOW");
        require(newReserveOut < type(uint112).max, "RESERVEOUT OVERFLOW");
    }
}