pragma solidity 0.8.17;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {CreationProxy} from "../../src/CreationProxy.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";
import {ICreationProxy} from "../../src/interfaces/ICreationProxy.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Creation proxy instantiation test
/// @dev Tests instantiation in creation proxy.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract CreationProxyInstantiationTest is BaseTestSetup {
    function testZeroAddressFactory() external {
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressFactory()"));
        new CreationProxy(address(0), address(1), 1);
    }

    function testZeroAddressKPITokensManager() external {
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressKpiTokensManager()"));
        new CreationProxy(address(1), address(0), 1);
    }

    function testZeroTemplate() external {
        vm.expectRevert(abi.encodeWithSignature("InvalidTemplateId()"));
        new CreationProxy(address(1), address(1), 0);
    }

    function testSuccess() external {
        address _factory = address(1);
        address _kpiTokensManager = address(1);
        uint256 _templateId = 1;

        CreationProxy _creationProxy = new CreationProxy(
            _factory,
            _kpiTokensManager,
            _templateId
        );

        assertEq(_creationProxy.factory(), _factory);
        assertEq(_creationProxy.kpiTokensManager(), _kpiTokensManager);
        assertEq(_creationProxy.templateId(), _templateId);
    }
}
