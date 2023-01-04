pragma solidity 0.8.17;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {CreationProxy} from "../src/CreationProxy.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Deploy creation proxy
/// @dev Deploys the creation proxy on a target network.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract DeployCreationProxy is Script {
    function run(address _factory, address _kpiTokensManager, uint256 _templateId) external {
        vm.broadcast();
        CreationProxy _creationProxy = new CreationProxy(
            _factory,
            _kpiTokensManager,
            _templateId
        );
        console2.log("Creation proxy deployed at address", address(_creationProxy));
    }
}
