// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceFeeder is Ownable {
    string public route = "FREIGHT_SH-LA";
    uint256 public latestValue;
    uint256 public latestTimestamp;

    event PriceUpdated(uint256 value, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function updatePrice(uint256 newValue) external onlyOwner {
        latestValue = newValue;
        latestTimestamp = block.timestamp;
        emit PriceUpdated(newValue, latestTimestamp);
    }

    function getLatest() external view returns (uint256 value, uint256 timestamp, string memory _route) {
        return (latestValue, latestTimestamp, route);
    }
}