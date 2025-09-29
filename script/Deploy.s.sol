// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PriceFeeder.sol";

contract DeployPriceFeeder is Script {
    function run() external {
        vm.startBroadcast(); // Foundry will use --private-key from CLI
        PriceFeeder feeder = new PriceFeeder();
        console.log("Deployed at:", address(feeder));
        vm.stopBroadcast();
    }
}