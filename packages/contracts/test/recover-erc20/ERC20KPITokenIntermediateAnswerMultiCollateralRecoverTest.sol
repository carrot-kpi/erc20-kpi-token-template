pragma solidity 0.8.19;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token recover test
/// @dev Tests recover in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenIntermediateAnswerMultiCollateralRecoverTest is BaseTestSetup {
    function testIntermediateBoundAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 3 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] =
            OracleData({templateId: 1, lowerBound: 10, higherBound: 12, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 3 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 3 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(11);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1);
        assertEq(secondErc20.balanceOf(address(this)), 1.4955 ether);
    }

    function testIntermediateBoundAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 3 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] =
            OracleData({templateId: 1, lowerBound: 10, higherBound: 12, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 3 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 3 ether);

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
        kpiTokenInstance.finalize(11);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 2);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 2.991 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
    }

    function testIntermediateBoundAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 102 ether, minimumPayout: 91.5 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 10 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 20 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 10 ether);
        secondErc20.mint(address(this), 102 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 10 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 102 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(12 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 7.176 ether);
        assertEq(secondErc20.balanceOf(address(this)), 8.1552 ether);
    }

    function testIntermediateBoundAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 102 ether, minimumPayout: 91.5 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 10 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10 ether,
            higherBound: 20 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 10 ether);
        secondErc20.mint(address(this), 102 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 10 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 102 ether);

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
        kpiTokenInstance.finalize(12 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 8.97 ether);
        assertEq(secondErc20.balanceOf(address(this)), 10.194 ether);
    }

    function testIntermediateBoundOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 40 ether,
            higherBound: 50 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

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
        kpiTokenInstance.finalize(45 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0.997 ether);
        assertEq(secondErc20.balanceOf(address(this)), 1.994 ether);
    }

    function testIntermediateBoundOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 40 ether,
            higherBound: 50 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2 ether);
        secondErc20.mint(address(this), 4 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 4 ether);

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
        kpiTokenInstance.finalize(45 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1.994 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 3.988 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
    }

    function testIntermediateBoundOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 45 ether, minimumPayout: 22 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 821 ether, minimumPayout: 38 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 102 ether,
            higherBound: 286 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 45 ether);
        secondErc20.mint(address(this), 821 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 45 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 821 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(153 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 16.527418478260869565 ether);
        assertEq(secondErc20.balanceOf(address(this)), 564.192505434782608695 ether);
    }

    function testIntermediateBoundOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 45 ether, minimumPayout: 22 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 821 ether, minimumPayout: 38 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 102 ether,
            higherBound: 286 ether,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 45 ether);
        secondErc20.mint(address(this), 821 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 45 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 821 ether);

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
        kpiTokenInstance.finalize(153 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 22.865 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 22 ether);
        assertEq(secondErc20.balanceOf(address(this)), 780.537 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 38 ether);
    }

    function testIntermediateBoundAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0.24925 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0.4985 ether);
    }

    function testIntermediateBoundAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(13 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 1.994 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 3.988 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
    }

    function testIntermediateBoundAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 26 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0.100404040404040404 ether);
        assertEq(secondErc20.balanceOf(address(this)), 1.608282828282828282 ether);
    }

    function testIntermediateBoundAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2 ether, minimumPayout: 1 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 26 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(33 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0.994 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 1 ether);
        assertEq(secondErc20.balanceOf(address(this)), 15.922 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }
}