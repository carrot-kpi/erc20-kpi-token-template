pragma solidity 0.8.23;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Reward, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenBaseFinalizeTest is BaseTestSetup {
    function testNotInitialized() external {
        IERC20KPIToken kpiTokenInstance = IERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.finalize(0);
    }

    function testInvalidCallerNotAnOracle() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.finalize(0);
    }

    function testInvalidCallerAlreadyFinalizedOracle() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);
        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(0);
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        kpiTokenInstance.finalize(0);
    }

    function testValidCallerAlreadyFinalizedKpiToken() external {
        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 2, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

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
        IERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount, kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        vm.prank(kpiTokenInstance.oracles()[0]);
        kpiTokenInstance.finalize(0);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);

        (Reward[] memory onChainRewards, FinalizableOracle[] memory onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].token, _rewards[0].token);
        assertEq(onChainRewards[0].amount, 0);
        assertEq(onChainRewards[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        vm.prank(kpiTokenInstance.oracles()[1]);
        kpiTokenInstance.finalize(0);

        (onChainRewards, onChainFinalizableOracles,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].token, _rewards[0].token);
        assertEq(onChainRewards[0].amount, 0);
        assertEq(onChainRewards[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(onChainFinalizableOracles[1].finalized);
    }
}
