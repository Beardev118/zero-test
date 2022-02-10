//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZeroTest is Ownable {

    using SafeMath for uint256;
    uint256 _arrayLimit;
    address[] addresses;

    constructor (uint256 _contributorsCount) public {
        setArrayLimit(_contributorsCount);
    }

    function setArrayLimit(uint256 _count) private {
        _arrayLimit = _count;
    }

    function multisendToken(address _token, address[] memory _contributors, uint256 amount) external payable {
        require((amount > 0) || msg.value > 0, "no money!");
        require(_contributors.length <= _arrayLimit, "Too many dividers");
        if (msg.value > 0) {
            uint fee = msg.value / 1000;
            uint remain = msg.value.sub(fee);
            uint dividend = remain / _contributors.length;
            for (uint256 index = 0; index < _contributors.length; index++) {
                (bool sent, bytes memory data) = _contributors[index].call{value: dividend}("");
            }
        }
        if (amount > 0) {
            require(_token != address(0), "impossible!");
            IERC20(_token).transferFrom(msg.sender, address(this), amount);
            uint fee = amount / 1000;
            uint remain = amount.sub(fee);
            uint dividend = remain / _contributors.length;
            for (uint256 index = 0; index < _contributors.length; index++) {
                IERC20(_token).transfer(_contributors[index], dividend);
            }
        }
    }

    function withdraw(address _token, uint256 amount) external onlyOwner {
        if (_token == address(this)) {
            require(address(this).balance >= amount, "insufficient balance!");
            (bool sent, bytes memory data) = msg.sender.call{value: amount}("");
        } else {
            require(IERC20(_token).balanceOf(address(this)) >= amount, "insufficient balance!");
            IERC20(_token).transfer(msg.sender, amount);
        }
    }
}