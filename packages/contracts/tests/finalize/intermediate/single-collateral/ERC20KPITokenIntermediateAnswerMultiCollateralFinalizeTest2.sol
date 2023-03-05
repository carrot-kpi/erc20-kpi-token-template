pragma solidity 0.8.17;

import {BaseTestSetup} from "../../../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../../../src/ERC20KPIToken.sol";
import {
    IERC20KPIToken, OracleData, Collateral, FinalizableOracle
} from "../../../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenIntermediateAnswerMultiCollateralFinalizeTest2 is BaseTestSetup {
    function testIntermediateBoundAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 14 ether,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 20 ether,
            higherBound: 26 ether,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2 ether);
        secondErc20.mint(address(this), 4 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(13 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1.74475 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 0);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 3.4895 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testIntermediateBoundAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 26 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 43 ether,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 200 ether,
            higherBound: 2607 ether,
            weight: 2,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2 ether);
        secondErc20.mint(address(this), 26 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 26 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(33 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1.893595959595959596 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 1 ether);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 24.313717171717171718 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 10 ether);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }
}
