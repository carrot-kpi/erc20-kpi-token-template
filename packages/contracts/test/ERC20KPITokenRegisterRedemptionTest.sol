pragma solidity 0.8.19;

import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token register redemption test
/// @dev Tests ERC20 KPI token redemption registration.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenRegisterRedemptionTest is BaseTestSetup {
    function testNotFinalized() external {
        IERC20KPIToken _kpiToken = createKpiToken("a");
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        _kpiToken.registerRedemption();
    }

    function testNoBalance() external {
        IERC20KPIToken _kpiToken = createKpiToken("a");

        vm.prank(_kpiToken.oracles()[0]);
        _kpiToken.finalize(0);

        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        vm.prank(address(1));
        _kpiToken.registerRedemption();
    }

    function testSuccess() external {
        IERC20KPIToken _kpiToken = createKpiToken("a");
        assertEq(_kpiToken.balanceOf(address(this)), 100 ether);

        vm.prank(_kpiToken.oracles()[0]);
        _kpiToken.finalize(0);

        _kpiToken.registerRedemption();
        assertEq(_kpiToken.balanceOf(address(this)), 0 ether);
    }

    function testExpired() external {
        IERC20KPIToken _kpiToken = createKpiToken("a");
        assertEq(_kpiToken.balanceOf(address(this)), 100 ether);

        vm.warp(_kpiToken.expiration());

        vm.prank(_kpiToken.oracles()[0]);
        _kpiToken.finalize(0);

        _kpiToken.registerRedemption();
        assertEq(_kpiToken.balanceOf(address(this)), 0 ether);
    }
}