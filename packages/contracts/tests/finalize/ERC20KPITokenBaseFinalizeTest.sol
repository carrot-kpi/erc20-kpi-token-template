pragma solidity 0.8.17;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenBaseFinalizeTest is BaseTestSetup {
    function testNotInitialized() external {
        IERC20KPIToken kpiTokenInstance = IERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.finalize(0);
    }

    function testInvalidCallerNotAnOracle() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a");
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.finalize(0);
    }

    function testInvalidCallerAlreadyFinalizedOracle() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a");
        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.finalize(0);
    }

    function testValidCallerAlreadyFinalizedKpiToken() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] =
            OracleData({templateId: 1, lowerBound: 10, higherBound: 11, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] =
            OracleData({templateId: 1, lowerBound: 20, higherBound: 21, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        IERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.prank(kpiTokenInstance.oracles()[0]);
        kpiTokenInstance.finalize(5);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        vm.prank(kpiTokenInstance.oracles()[1]);
        kpiTokenInstance.finalize(0);

        (onChainCollaterals, onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(onChainFinalizableOracles[1].finalized);
    }
}
