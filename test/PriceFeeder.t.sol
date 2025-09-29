// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PriceFeeder.sol";

contract PriceFeederTest is Test {
    PriceFeeder feeder;

    function setUp() public {
        feeder = new PriceFeeder();
    }

    function testUpdatePrice() public {
        feeder.updatePrice(2000);
        (uint256 value, uint256 timestamp, string memory _route) = feeder.getLatest();
        assertEq(value, 2000);
        assertGt(timestamp, 0);
        assertEq(_route, "FREIGHT_SH-LA");
    }
}