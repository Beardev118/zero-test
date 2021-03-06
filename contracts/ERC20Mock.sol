
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor (string memory name, string memory symbol) ERC20(name, symbol) {}
    function mint(address receiver, uint256 amount) external {
        _mint(receiver, amount);
    }
}