pragma solidity 0.8.21;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Deploy
/// @dev Deploys the template on a target network.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract Deploy is Script {
    function run() external {
        vm.broadcast();
        ERC20KPIToken _kpiTokenTemplate = new ERC20KPIToken();
        console2.log("Template deployed at address", address(_kpiTokenTemplate));
    }
}
