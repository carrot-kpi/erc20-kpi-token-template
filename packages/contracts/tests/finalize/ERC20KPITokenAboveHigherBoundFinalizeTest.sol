pragma solidity 0.8.17;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenAboveHigherBoundFinalizeTest is BaseTestSetup {
    function testOverHigherBoundAndRelationshipSingleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 43 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 20 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(10023 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundAndRelationshipMultipleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 12 ether,
            higherBound: 72 ether,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 102 ether,
            higherBound: 430 ether,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 20 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(97 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundOrRelationshipSingleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 43 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 20 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(10023 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundOrRelationshipMultipleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 12 ether,
            higherBound: 72 ether,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 102 ether,
            higherBound: 430 ether,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 20 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(97 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundAndRelationshipSingleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 35 ether, minimumPayout: 12.2 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 43 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 20 ether);
        secondErc20.mint(address(this), 35 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 35 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(10023 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 34.895 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 12.2 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundAndRelationshipMultipleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 20.23 ether, minimumPayout: 18.9 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 12 ether,
            higherBound: 72 ether,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 102 ether,
            higherBound: 430 ether,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 20 ether);
        secondErc20.mint(address(this), 20.23 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 20.23 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(97 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 20.16931 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 18.9 ether);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundOrRelationshipSingleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 29 ether, minimumPayout: 28 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 43 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 20 ether);
        secondErc20.mint(address(this), 29 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 29 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(10023 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 28.913 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 28 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundOrRelationshipMultipleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 12.65 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 12 ether,
            higherBound: 72 ether,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 102 ether,
            higherBound: 430 ether,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 20 ether);
        secondErc20.mint(address(this), 12.65 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 20 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 12.65 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(97 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 19.94 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 10 ether);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 12.61205 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 10 ether);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }
}
