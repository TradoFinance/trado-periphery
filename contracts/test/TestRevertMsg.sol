// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

contract TestRevertMsg {
    function revertErrorData(bytes memory data) external {
        // if (data.length < 68) revert('Unexpected error');
        // assembly {
        //     data := add(data, 0x04)
        // }
        revert(abi.decode(data, (string)));
    }
}
