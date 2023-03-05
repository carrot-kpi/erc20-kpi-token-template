pragma solidity 0.8.17;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {CreationProxy} from "../../src/CreationProxy.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Creation proxy instantiation test
/// @dev Tests instantiation in creation proxy.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract CreationProxyInstantiationTest is BaseTestSetup {
    function testSuccess() external {
        new CreationProxy();
    }
}
