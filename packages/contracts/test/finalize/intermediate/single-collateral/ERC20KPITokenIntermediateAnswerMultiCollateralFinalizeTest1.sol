pragma solidity 0.8.23;

import {BaseTestSetup} from "../../../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Reward, FinalizableOracle} from "../../../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenIntermediateAnswerMultiRewardFinalizeTest1 is BaseTestSetup {
    function testIntermediateAnswerAndRelationshipSingleOracleZeroMinimumPayoutMultiReward() external {
        Reward[] memory _rewards = new Reward[](2);
        _rewards[0] = Reward({token: address(firstErc20), amount: 2, minimumPayout: 0});
        _rewards[1] = Reward({token: address(secondErc20), amount: 3 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 2);
        assertEq(onChainRewards[0].token, _rewards[0].token);
        assertEq(onChainRewards[0].amount, 1);
        assertEq(onChainRewards[0].minimumPayout, 0);
        assertEq(onChainRewards[1].token, _rewards[1].token);
        assertEq(onChainRewards[1].amount, 1.5 ether);
        assertEq(onChainRewards[1].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testIntermediateAnswerAndRelationshipSingleOracleNonZeroMinimumPayoutMultiReward() external {
        Reward[] memory _rewards = new Reward[](2);
        _rewards[0] = Reward({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        _rewards[1] = Reward({token: address(secondErc20), amount: 102 ether, minimumPayout: 91.5 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 10 ether, false);

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

        (Reward[] memory onChainRewards, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 2);
        assertEq(onChainRewards[0].token, _rewards[0].token);
        assertEq(onChainRewards[0].amount, 2.8 ether); // take into account the minimum payout
        assertEq(onChainRewards[0].minimumPayout, 1 ether);
        assertEq(onChainRewards[1].token, _rewards[1].token);
        assertEq(onChainRewards[1].amount, 93.6 ether); // take into account the minimum payout
        assertEq(onChainRewards[1].minimumPayout, 91.5 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testIntermediateAnswerOrRelationshipSingleOracleZeroMinimumPayoutMultiReward() external {
        Reward[] memory _rewards = new Reward[](2);
        _rewards[0] = Reward({token: address(firstErc20), amount: 2 ether, minimumPayout: 0});
        _rewards[1] = Reward({token: address(secondErc20), amount: 4 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertTrue(kpiTokenInstance.finalized());

        assertEq(onChainRewards.length, 2);
        assertEq(onChainRewards[0].token, _rewards[0].token);
        assertEq(onChainRewards[0].amount, 1 ether);
        assertEq(onChainRewards[0].minimumPayout, 0);
        assertEq(onChainRewards[1].token, _rewards[1].token);
        assertEq(onChainRewards[1].amount, 2 ether);
        assertEq(onChainRewards[1].minimumPayout, 0);

        assertTrue(onChainFinalizableOracles[0].finalized);

        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }

    function testIntermediateAnswerOrRelationshipSingleOracleNonZeroMinimumPayoutMultiReward() external {
        Reward[] memory _rewards = new Reward[](2);
        _rewards[0] = Reward({token: address(firstErc20), amount: 45 ether, minimumPayout: 22 ether});
        _rewards[1] = Reward({token: address(secondErc20), amount: 821 ether, minimumPayout: 38 ether});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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

        (Reward[] memory onChainRewards, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 2);
        assertEq(onChainRewards[0].token, _rewards[0].token);
        assertEq(onChainRewards[0].amount, 28.374979 ether);
        assertEq(onChainRewards[0].minimumPayout, 22 ether);
        assertEq(onChainRewards[1].token, _rewards[1].token);
        assertEq(onChainRewards[1].amount, 255.026459 ether);
        assertEq(onChainRewards[1].minimumPayout, 38 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0 ether);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }
}
