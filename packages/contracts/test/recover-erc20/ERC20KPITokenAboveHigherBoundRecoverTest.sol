pragma solidity 0.8.19;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenAboveHigherBoundRecoverTest is BaseTestSetup {
    function testOverHigherBoundAndRelationshipSingleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundAndRelationshipSingleOracleExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(10023 ether);

        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 19.94 ether);
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }

    function testOverHigherBoundAndRelationshipMultipleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundAndRelationshipMultipleOracleExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        address _holder = address(1234567876543);
        kpiTokenInstance.transfer(_holder, 50 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(97 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);

        vm.prank(kpiTokenInstance.oracles()[1]);
        kpiTokenInstance.finalize(97 ether);

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);

        vm.prank(_holder);
        kpiTokenInstance.redeem(abi.encode(_holder));
        assertEq(firstErc20.balanceOf(_holder), 5 ether);
    }

    function testOverHigherBoundOrRelationshipSingleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundOrRelationshipSingleOracleExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(10023 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }

    function testOverHigherBoundOrRelationshipMultiOracleExpiredExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(97 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }

    function testOverHigherBoundOrRelationshipMultipleOracle() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(97 ether);

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
    }

    function testOverHigherBoundOrRelationshipMultipleOracleExpired() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 50 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        firstErc20.mint(address(this), 50 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 50 ether);

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
        kpiTokenInstance.finalize(97 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        assertEq(firstErc20.balanceOf(address(this)), 39.85 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }

    function testOverHigherBoundAndRelationshipSingleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 35 ether, minimumPayout: 12.2 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testOverHigherBoundAndRelationshipSingleOracleMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 35 ether, minimumPayout: 12.2 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(10023 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
        assertEq(secondErc20.balanceOf(address(this)), 22.695 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 12.2 ether);
    }

    function testOverHigherBoundAndRelationshipMultipleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 20.23 ether, minimumPayout: 18.9 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testOverHigherBoundAndRelationshipMultipleOracleMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 20.23 ether, minimumPayout: 18.9 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(97 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
        assertEq(secondErc20.balanceOf(address(this)), 1.26931 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 18.9 ether);
    }

    function testOverHigherBoundOrRelationshipSingleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 29 ether, minimumPayout: 28 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testOverHigherBoundOrRelationshipSingleOracleMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 29 ether, minimumPayout: 28 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(10023 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0.913 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 28 ether);
    }

    function testOverHigherBoundOrRelationshipMultipleOracleMultiCollateral() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 12.65 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testOverHigherBoundOrRelationshipMultipleOracleMultiCollateralExpired() external {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 20 ether, minimumPayout: 10 ether});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 12.65 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

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
        kpiTokenInstance.finalize(97 ether);

        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        kpiTokenInstance.recoverERC20(address(secondErc20), address(this));

        assertEq(firstErc20.balanceOf(address(this)), 9.94 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
        assertEq(secondErc20.balanceOf(address(this)), 2.61205 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 10 ether);
    }
}
