pragma solidity 0.8.21;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token recover test
/// @dev Tests recover in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenIntermediateAnswerMultiCollateralRecoverTest is BaseTestSetup {
    function testIntermediateAnswerAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 3 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 3.03 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 3.03 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(500_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 1.5 ether);
    }

    function testIntermediateAnswerAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 3 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 3.03 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 3.03 ether);

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
        kpiTokenInstance.finalize(500_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 3 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
    }

    function testIntermediateAnswerAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 102 ether, minimumPayout: 91.5 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 10 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 10.1 ether);
        secondErc20.mint(address(this), 103.02 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 10.1 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 103.02 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(200_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 7.2 ether);
        assertEq(secondErc20.balanceOf(address(this)), 8.4 ether);
    }

    function testIntermediateAnswerAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 102 ether, minimumPayout: 91.5 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 10 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 10.1 ether);
        secondErc20.mint(address(this), 103.02 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 10.1 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 103.02 ether);

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
        kpiTokenInstance.finalize(200_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9 ether);
        assertEq(secondErc20.balanceOf(address(this)), 10.5 ether);
    }

    function testIntermediateAnswerOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 4.04 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4.04 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(500_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1 ether);
        assertEq(secondErc20.balanceOf(address(this)), 2 ether);
    }

    function testIntermediateAnswerOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 4.04 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4.04 ether);

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
        kpiTokenInstance.finalize(500_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 4 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
    }

    function testIntermediateAnswerOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 45 ether, minimumPayout: 22 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 821 ether, minimumPayout: 38 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 45.45 ether);
        secondErc20.mint(address(this), 829.21 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 45.45 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 829.21 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(277_173);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 16.625021 ether);
        assertEq(secondErc20.balanceOf(address(this)), 565.973541 ether);
    }

    function testIntermediateAnswerOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 45 ether, minimumPayout: 22 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 821 ether, minimumPayout: 38 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 45.45 ether);
        secondErc20.mint(address(this), 829.21 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 45.45 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 829.21 ether);

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
        kpiTokenInstance.finalize(277_173);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 23 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 22 ether);
        assertEq(secondErc20.balanceOf(address(this)), 783 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 38 ether);
    }

    function testIntermediateAnswerAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 4.04 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4.04 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(750_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0.25 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0.5 ether);
    }

    function testIntermediateAnswerAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 4.04 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4.04 ether);

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
        kpiTokenInstance.finalize(750_000);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 4 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
    }

    function testIntermediateAnswerAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 26 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 2, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 26.26 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 26.26 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(696_969);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0.101010333333333333 ether);
        assertEq(secondErc20.balanceOf(address(this)), 1.616165333333333333 ether);
    }

    function testIntermediateAnswerAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateralExpired()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 26 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 2, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2.02 ether);
        secondErc20.mint(address(this), 26.26 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 26.26 ether);

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
        kpiTokenInstance.finalize(696_969);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 1 ether);
        assertEq(secondErc20.balanceOf(address(this)), 16 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }
}
