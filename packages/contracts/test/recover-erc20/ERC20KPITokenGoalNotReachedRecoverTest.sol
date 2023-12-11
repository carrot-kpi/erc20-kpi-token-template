pragma solidity 0.8.21;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token recover test
/// @dev Tests recover in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenGoalNotReachedRecoverTest is BaseTestSetup {
    function testGoalNotReachedAndRelationshipSingleOracleZeroMinimumPayout() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
    }

    function testGoalNotReachedAndRelationshipSingleOracleZeroMinimumPayoutExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
    }

    function testGoalNotReachedAndRelationshipSingleOracleNonZeroMinimumPayout() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
    }

    function testGoalNotReachedAndRelationshipSingleOracleNonZeroMinimumPayoutExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2.02 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1 ether);
    }

    function testGoalNotReachedOrRelationshipSingleOracleZeroMinimumPayout() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
    }

    function testGoalNotReachedOrRelationshipSingleOracleZeroMinimumPayoutExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
    }

    function testGoalNotReachedOrRelationshipSingleOracleNonZeroMinimumPayout() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
    }

    function testGoalNotReachedOrRelationshipSingleOracleNonZeroMinimumPayoutExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesZeroMinimumPayout() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesZeroMinimumPayoutExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesNonZeroMinimumPayout() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesNonZeroMinimumPayoutExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 1);
    }

    function testGoalNotReachedAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 4);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(secondErc20.balanceOf(address(this)), 4);
    }

    function testGoalNotReachedAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 4);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(secondErc20.balanceOf(address(this)), 4);
    }

    function testGoalNotReachedAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 7 ether, minimumPayout: 6 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 7.07 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 7.07 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 1 ether);
    }

    function testGoalNotReachedAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 7 ether, minimumPayout: 6 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 7.07 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 7.07 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 1 ether);
    }

    function testGoalNotReachedOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 1 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 1.01 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 1.01 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(secondErc20.balanceOf(address(this)), 1 ether);
    }

    function testGoalNotReachedOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 1 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 1.01 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 1.01 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(secondErc20.balanceOf(address(this)), 1 ether);
    }

    function testGoalNotReachedOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 3.5 ether, minimumPayout: 1.2 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 3.535 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 3.535 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 2.3 ether);
    }

    function testGoalNotReachedOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 3.5 ether, minimumPayout: 1.2 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 3.535 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 3.535 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1 ether);
        assertEq(secondErc20.balanceOf(address(this)), 2.3 ether);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 23 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 23.23 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 23.23 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(secondErc20.balanceOf(address(this)), 23 ether);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 23 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 23.23 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 23.23 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(secondErc20.balanceOf(address(this)), 23 ether);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 40 ether, minimumPayout: 32.398938393 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 40.4 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 40.4 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 7.601061607 ether);
    }

    function testGoalNotReachedAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 40 ether, minimumPayout: 32.398938393 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 40.4 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 40.4 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 7.601061607 ether);
    }
}
