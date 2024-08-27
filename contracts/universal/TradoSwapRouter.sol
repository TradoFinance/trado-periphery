// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import "../core/interfaces/ITradoSwapCallback.sol";
import "../core/interfaces/ITradoSwapFactory.sol";
import "../core/interfaces/ITradoSwapPool.sol";

import "../libraries/Path.sol";

import "./interfaces/ITradoSwapClassicPair.sol";
import "./interfaces/ITradoSwapClassicFactory.sol";

import "./types.sol";

abstract contract TradoSwapRouter is ITradoSwapCallback {

    using Path for bytes;

    function TradoSwapPool(address tokenX, address tokenY, uint24 fee) public view returns(address) {
        return ITradoSwapFactory(TradoSwapFactory).pool(tokenX, tokenY, fee);
    }
    function TradoSwapVerify(address tokenX, address tokenY, uint24 fee) internal view {
        require (msg.sender == TradoSwapPool(tokenX, tokenY, fee), "sp");
    }

    address public TradoSwapFactory;

    /// @notice constructor to create this contract
    /// @param _TradoSwapFactory address of TradoSwap factory
    constructor(address _TradoSwapFactory) {
        TradoSwapFactory = _TradoSwapFactory;
    }

    /// @notice Callback for swapY2X and swapY2XDesireX, in order to pay tokenY from trader.
    /// @param x amount of tokenX trader acquired
    /// @param y amount of tokenY need to pay from trader
    /// @param data encoded SwapCallbackData
    function swapY2XCallback(
        uint256 x,
        uint256 y,
        bytes calldata data
    ) external override {
        SwapCallbackData memory dt = abi.decode(data, (SwapCallbackData));

        (address token0, address token1, uint24 fee) = dt.path.decodeFirstPool();
        TradoSwapVerify(token0, token1, fee);
        if (token0 < token1) {
            // token1 is y, amount of token1 is calculated
            // called from swapY2XDesireX(...)
            if (dt.path.hasMultiplePools()) {
                dt.path = dt.path.skipToken();
                swapDesireInternal(y, msg.sender, dt);
            } else {
                pay(token1, dt.payer, msg.sender, y);
            }
        } else {
            // token0 is y, amount of token0 is input param
            // called from swapY2X(...)
            pay(token0, dt.payer, msg.sender, y);
        }
    }

    /// @notice Callback for swapX2Y and swapX2YDesireY, in order to pay tokenX from trader.
    /// @param x amount of tokenX need to pay from trader
    /// @param y amount of tokenY trader acquired
    /// @param data encoded SwapCallbackData
    function swapX2YCallback(
        uint256 x,
        uint256 y,
        bytes calldata data
    ) external override {
        SwapCallbackData memory dt = abi.decode(data, (SwapCallbackData));
        (address token0, address token1, uint24 fee) = dt.path.decodeFirstPool();
        TradoSwapVerify(token0, token1, fee);
        if (token0 < token1) {
            // token0 is x, amount of token0 is input param
            // called from swapX2Y(...)
            pay(token0, dt.payer, msg.sender, x);
        } else {
            // token1 is x, amount of token1 is calculated param
            // called from swapX2YDesireY(...)
            if (dt.path.hasMultiplePools()) {
                dt.path = dt.path.skipToken();
                swapDesireInternal(x, msg.sender, dt);
            } else {
                pay(token1, dt.payer, msg.sender, x);
            }
        }
    }


    function TradoSwapDesireSingleInternal(
        SwapSingleParams memory params,
        SwapCallbackData memory data
    ) internal returns (uint256 acquire) {
        
        address poolAddr = TradoSwapPool(params.tokenOut, params.tokenIn, params.fee);
        if (params.tokenOut < params.tokenIn) {
            // tokenOut is tokenX, tokenIn is tokenY
            // we should call y2XDesireX

            (acquire, ) = ITradoSwapPool(poolAddr).swapY2XDesireX(
                params.recipient, uint128(params.amount), 799999,
                abi.encode(data)
            );
        } else {
            // tokenOut is tokenY
            // tokenIn is tokenX
            (, acquire) = ITradoSwapPool(poolAddr).swapX2YDesireY(
                params.recipient, uint128(params.amount), -799999,
                abi.encode(data)
            );
        }
    }

    function TradoSwapAmountSingleInternal(
        SwapSingleParams memory params,
        address payer
    ) internal returns (uint256 cost, uint256 acquire) {
        
        address poolAddr = TradoSwapPool(params.tokenOut, params.tokenIn, params.fee);
        if (params.tokenIn < params.tokenOut) {
            // swapX2Y
            (cost, acquire) = ITradoSwapPool(poolAddr).swapX2Y(
                params.recipient, uint128(params.amount), -799999,
                abi.encode(SwapCallbackData({path: abi.encodePacked(params.tokenIn, params.fee, params.tokenOut), payer: payer}))
            );
        } else {
            // swapY2X
            uint256 costY;
            (acquire, costY) = ITradoSwapPool(poolAddr).swapY2X(
                params.recipient, uint128(params.amount), 799999,
                abi.encode(SwapCallbackData({path: abi.encodePacked(params.tokenIn, params.fee, params.tokenOut), payer: payer}))
            );
        }
    }

    function swapDesireInternal(
        uint256 desire,
        address recipient,
        SwapCallbackData memory data
    ) internal virtual returns (uint256 acquire, address tokenOut) {}

    function pay(
        address token,
        address payer,
        address recipient,
        uint256 amount
    ) internal virtual {}
}