pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Deploy
/// @dev Deploys the template on a target network.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract DeployTemplate is Script {
    function run() external {
        vm.broadcast();
        ERC20KPIToken _kpiTokenTemplate = new ERC20KPIToken();
        console2.log("Template deployed at address", address(_kpiTokenTemplate));
    }
}
