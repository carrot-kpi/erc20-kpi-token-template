pragma solidity 0.8.21;

import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";
import {console2} from "forge-std/console2.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token redeem test
/// @dev Tests redemption in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenRedeemCollateralTest is BaseTestSetup {
    function testZeroAddressToken() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressToken()"));
        kpiTokenInstance.redeemCollateral(address(0), address(1));
    }

    function testZeroAddressReceiver() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressReceiver()"));
        kpiTokenInstance.redeemCollateral(address(1), address(0));
    }

    function testNotInitialized() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(1), address(1));
    }

    function testNotFinalized() external {
        ERC20KPIToken kpiTokenInstance = createKpiToken("a");
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(1), address(1));
    }

    function testNoRedeemRegistration() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a");
        vm.prank(kpiTokenInstance.oracles()[0]);
        kpiTokenInstance.finalize(0);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        vm.prank(address(12345));
        kpiTokenInstance.redeemCollateral(address(2), address(2));
    }

    function testInvalidCollateral() external {
        ERC20KPIToken kpiTokenInstance = createKpiToken("a");
        vm.prank(kpiTokenInstance.oracles()[0]);
        kpiTokenInstance.finalize(0);
        kpiTokenInstance.registerRedemption();
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(1999292929), address(2));
    }

    function testGoalNotReachedSingleOracle() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 0 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), address(holder));
        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 110 ether);
    }

    function testGoalNotReachedMultipleOracleAndRelationship() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertTrue(kpiTokenInstance.finalized());
        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 0 ether);
        assertEq(onChainOracles.length, 2);
        assertTrue(onChainOracles[0].finalized);
        // second oracle is not finalized, even though the token is
        assertTrue(!onChainOracles[1].finalized);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), address(holder));
        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 110 ether);

        vm.prank(kpiTokenInstance.oracles()[1]);
        kpiTokenInstance.finalize(0);

        (onChainCollaterals, onChainOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertTrue(kpiTokenInstance.finalized());
        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 0 ether);
        assertEq(onChainOracles.length, 2);
        assertTrue(onChainOracles[0].finalized);
        // second oracle is now finalized, but nothing else changed
        assertTrue(onChainOracles[1].finalized);
    }

    function testGoalNotReachedMultipleOracleAndRelationshipFirstSecondFinalization() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(100 ether);

        (Collateral[] memory onChainCollaterals, FinalizableOracle[] memory onChainOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertTrue(!kpiTokenInstance.finalized());
        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);
        assertEq(onChainOracles.length, 2);
        assertTrue(onChainOracles[0].finalized);
        assertTrue(!onChainOracles[1].finalized);

        vm.prank(holder);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 110 ether);

        vm.prank(kpiTokenInstance.oracles()[1]);
        kpiTokenInstance.finalize(0);

        (onChainCollaterals, onChainOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertTrue(kpiTokenInstance.finalized());
        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainOracles.length, 2);
        assertTrue(onChainOracles[0].finalized);
        assertTrue(onChainOracles[1].finalized);
    }

    function testGoalNotReachedSingleOracleExpired() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 110 ether);
    }

    function testOverFullyReachedSingleOracle() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_001);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(holder), 1.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
    }

    function testOverFullyReachedSingleOracleDifferentReceiver() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_010);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), address(23));
        assertEq(kpiTokenInstance.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(address(23)), 1.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
    }

    function testOverFullyReachedSingleOracleDoubleRedemption() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_040);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(holder), 1.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
    }

    function testOverFullyReachedSingleOracleIncrementalRedemption() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_001);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(holder), 1.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);

        kpiTokenInstance.transfer(holder, 10 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(holder), 12.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 97.9 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
    }

    function testOverFullyReachedSingleOracleMultiCollateral() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        _collaterals[1] = Collateral({token: address(secondErc20), amount: 100 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        secondErc20.mint(address(this), 101 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);
        secondErc20.approve(_predictedKpiTokenAddress, 101 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_001);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].amount, 110 ether);
        assertEq(onChainCollaterals[1].amount, 100 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(kpiTokenInstance.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(holder), 1.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(secondErc20), holder);
        assertEq(secondErc20.balanceOf(holder), 1 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 99 ether);
    }

    function testOverFullyReachedSingleOracleExpired() external {
        address holder = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 40 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_001);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(firstErc20.balanceOf(holder), 0.4 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.6 ether);
    }

    function testIntermediateSingleOracle() external {
        address holder = address(71899398389892);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 22 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 22.22 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 22.22 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 7.333326 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);

        (onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 7.25999274 ether);

        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0.07333326 ether);
    }

    function testIntermediateSingleOracleDoubleRedemption() external {
        address holder = address(71899398389892);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 22 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 22.22 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 22.22 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 7.333326 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
    }

    function testIntermediateSingleOracleExpired() external {
        address holder = address(71899398389892);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 22 ether, minimumPayout: 1 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 22.22 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 22.22 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder);
        assertEq(firstErc20.balanceOf(holder), 0.01 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 21.99 ether);
    }

    function testGoalNotReachedSingleOracleMultipleParticipants() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 0 ether);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(firstErc20.balanceOf(holder1), 0 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(firstErc20.balanceOf(holder2), 0 ether);
    }

    function testGoalNotReachedSingleOracleMultipleParticipantsExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(firstErc20.balanceOf(holder1), 0.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.9 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(firstErc20.balanceOf(holder2), 1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
    }

    function testOverFullyReachedSingleOracleMultipleParticipants() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_001);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 1.1 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 11 ether);
    }

    function testOverFullyReachedSingleOracleMultipleParticipantsDoubleRedemption() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_001);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 1.1 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 11 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
    }

    function testOverFullyReachedSingleOracleMultipleParticipantsExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(100);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 110 ether);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(firstErc20.balanceOf(holder1), 0.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.9 ether);
    }

    function testIntermediateSingleOracleMultipleParticipants() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 36.66663 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0.3666663 ether);

        (Collateral[] memory onChainCollateralsAfterFirstRedemption,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));
        assertEq(onChainCollateralsAfterFirstRedemption[0].amount, 36.2999637 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 3.666663 ether);
    }

    function testIntermediateSingleOracleMultipleParticipantsDoubleRedemption() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 36.66663 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0.3666663 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 3.666663 ether);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
    }

    function testIntermediateSingleOracleMultipleParticipantsExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 10 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(firstErc20.balanceOf(holder1), 0.1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.9 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(firstErc20.balanceOf(holder2), 1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 108.9 ether);
    }

    function testIntermediateSingleOracleMultipleParticipantsMixedApproach() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 36.66663 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0.3666663 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 3.666663 ether);

        kpiTokenInstance.registerRedemption();
        kpiTokenInstance.redeemCollateral(address(firstErc20), address(this));
        assertEq(kpiTokenInstance.balanceOf(address(this)), 0);
        assertEq(kpiTokenInstance.totalSupply(), 0 ether);
        assertEq(firstErc20.balanceOf(address(this)), 32.6333007 ether);

        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 73.33337 ether);
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(firstErc20.balanceOf(address(this)), 105.9666707 ether);
    }

    function testIntermediateSingleOracleMultipleParticipantsMixedApproachDoubleRedemption() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        factory.createToken(1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].amount, 36.66663 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0.3666663 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 3.666663 ether);

        kpiTokenInstance.registerRedemption();
        kpiTokenInstance.redeemCollateral(address(firstErc20), address(this));
        assertEq(kpiTokenInstance.balanceOf(address(this)), 0);
        assertEq(kpiTokenInstance.totalSupply(), 0 ether);
        assertEq(firstErc20.balanceOf(address(this)), 32.6333007 ether);
        vm.expectRevert(abi.encodeWithSignature("NothingToRedeem()"));
        kpiTokenInstance.redeemCollateral(address(firstErc20), address(this));

        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 73.33337 ether);
        kpiTokenInstance.recoverERC20(address(firstErc20), address(this));
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(firstErc20.balanceOf(address(this)), 105.9666707 ether);
    }

    function testIntermediateSingleOracleMultipleParticipantsMixedApproachExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 20 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        kpiTokenInstance.transfer(holder2, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder2), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(11);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);
        assertEq(firstErc20.balanceOf(holder1), 0.2 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.8 ether);

        vm.prank(holder2);
        kpiTokenInstance.registerRedemption();
        vm.prank(holder2);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder2);
        assertEq(firstErc20.balanceOf(holder2), 2 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 107.8 ether);
    }

    function testIntermediateSingleOracleMultipleParticipantsMixedApproach2() external {
        address holder1 = address(123321);

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 60;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(_predictedKpiTokenAddress);

        kpiTokenInstance.transfer(holder1, 1 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 1 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(333_333);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));

        assertEq(firstErc20.balanceOf(holder1), 0.3666663 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.6333337 ether);

        kpiTokenInstance.transfer(holder1, 10 ether);
        assertEq(kpiTokenInstance.balanceOf(holder1), 10 ether);
        assertEq(kpiTokenInstance.balanceOf(address(this)), 89 ether);

        vm.prank(holder1);
        kpiTokenInstance.registerRedemption();

        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 109.6333337 ether);

        vm.prank(holder1);
        kpiTokenInstance.redeemCollateral(address(firstErc20), holder1);

        assertEq(firstErc20.balanceOf(holder1), 4.0333293 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 105.9666707 ether);
    }
}
