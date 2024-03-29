pragma solidity 0.8.23;

import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Reward, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token redeem test
/// @dev Tests redemption in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenRedeemTest is BaseTestSetup {
    function testZeroAddressReceiver() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressReceiver()"));
        kpiTokenInstance.redeem(abi.encode(address(0)));
    }

    function testNotInitialized() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeem(abi.encode(address(this)));
    }

    function testNotFinalized() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.redeem(abi.encode(address(this)));
    }

    function testNoBalance() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);
        vm.prank(kpiTokenInstance.oracles()[0]);
        kpiTokenInstance.finalize(0);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        vm.prank(address(12345));
        kpiTokenInstance.redeem(abi.encode(address(this)));
    }

    function testGoalNotReachedSingleOracle() external {
        address holder = address(123321);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 0 ether);

        vm.prank(holder);
        kpiTokenInstance.redeem(abi.encode(holder));
        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0 ether);
    }

    function testGoalNotReachedSingleOracleExpired() external {
        address holder = address(123321);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        kpiTokenInstance.redeem(abi.encode(holder));
        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0 ether);
    }

    function testOverReachedSingleOracle() external {
        address holder = address(71899398389892);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_010);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 110 ether);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.redeem(abi.encode(holder));

        (onChainRewards,,,) = abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 108.9 ether);

        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 1.1 ether);
    }

    function testOverReachedSingleOracleAlternateReceiver() external {
        address holder = address(71899398389892);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_010);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 110 ether);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.redeem(abi.encode(address(4224)));

        (onChainRewards,,,) = abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 108.9 ether);

        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0 ether);
        assertEq(firstErc20.balanceOf(address(4224)), 1.1 ether);
    }

    function testOverReachedSingleOracleExpired() external {
        address holder = address(71899398389892);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        assertEq(kpiTokenInstance.balanceOf(address(this)), 99 ether);

        vm.warp(_expiration);

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(1_000_012);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 110 ether);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.redeem(abi.encode(holder));

        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0 ether);
    }

    function testIntermediateSingleOracle() external {
        address holder = address(71899398389892);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 22 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 7.333326 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.redeem(abi.encode(holder));

        (onChainRewards,,,) = abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 7.25999274 ether);

        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0.07333326 ether);
    }

    function testIntermediateSingleOracleExpired() external {
        address holder = address(71899398389892);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 22 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        kpiTokenInstance.finalize(11);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 22 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        assertEq(firstErc20.balanceOf(holder), 0 ether);
        vm.prank(holder);
        kpiTokenInstance.redeem(abi.encode(holder));

        assertEq(kpiTokenInstance.balanceOf(holder), 0);
        assertEq(firstErc20.balanceOf(holder), 0 ether);
    }

    function testGoalNotReachedSingleOracleMultipleParticipants() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 0 ether);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(firstErc20.balanceOf(holder1), 0 ether);

        vm.prank(holder2);
        kpiTokenInstance.redeem(abi.encode(holder2));
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(firstErc20.balanceOf(holder2), 0 ether);
    }

    function testGoalNotReachedSingleOracleMultipleParticipantsExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(firstErc20.balanceOf(holder1), 0 ether);

        vm.prank(holder2);
        kpiTokenInstance.redeem(abi.encode(holder2));
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(firstErc20.balanceOf(holder2), 0 ether);
    }

    function testOverReachedSingleOracleMultipleParticipants() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        kpiTokenInstance.finalize(1_000_010);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 110 ether);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 1.1 ether);

        vm.prank(holder2);
        kpiTokenInstance.redeem(abi.encode(holder2));
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 11 ether);
    }

    function testOverReachedSingleOracleMultipleParticipantsExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0 ether);

        vm.prank(holder2);
        kpiTokenInstance.redeem(abi.encode(holder2));
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 0 ether);
    }

    function testIntermediateSingleOracleMultipleParticipants() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].amount, 36.66663 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0.3666663 ether);

        vm.prank(holder2);
        kpiTokenInstance.redeem(abi.encode(holder2));
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 3.666663 ether);
    }

    function testIntermediateSingleOracleMultipleParticipantsExpired() external {
        address holder1 = address(123321);
        address holder2 = address(19929999);

        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 110 ether);
        assertEq(firstErc20.balanceOf(address(this)), 0);

        vm.prank(holder1);
        kpiTokenInstance.redeem(abi.encode(holder1));
        assertEq(kpiTokenInstance.balanceOf(holder1), 0);
        assertEq(kpiTokenInstance.totalSupply(), 99 ether);
        assertEq(firstErc20.balanceOf(holder1), 0 ether);

        vm.prank(holder2);
        kpiTokenInstance.redeem(abi.encode(holder2));
        assertEq(kpiTokenInstance.balanceOf(holder2), 0);
        assertEq(kpiTokenInstance.totalSupply(), 89 ether);
        assertEq(firstErc20.balanceOf(holder2), 0 ether);
    }
}
