pragma solidity 0.8.23;

import {InitializeKPITokenParams} from "carrot/commons/Types.sol";
import {IBaseTemplatesManager} from "carrot/interfaces/IBaseTemplatesManager.sol";
import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken, JIT_FUNDING_FEATURE_ID} from "../src/ERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Reward, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token collect protocol fee test
/// @dev Tests ERC20 KPI token protocol fee collection.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenCollectProtocoFeeTest is BaseTestSetup {
    function initializeKpiToken(bool _justInTimeFunding) internal returns (address, ERC20KPIToken) {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10.1 ether);
        firstErc20.approve(address(kpiTokenInstance), 10.1 ether);

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});

        OracleData[] memory oracleData = new OracleData[](2);
        oracleData[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        oracleData[1] = OracleData({templateId: 1, weight: 3, value: 0, data: abi.encode("2")});
        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        if (_justInTimeFunding) {
            IBaseTemplatesManager(kpiTokensManager).enableTemplateFeatureFor(1, JIT_FUNDING_FEATURE_ID, address(this));
        }

        address feeReceiver = address(1234);
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(this),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: feeReceiver,
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 100 ether, _justInTimeFunding),
                oraclesData: abi.encode(oracleData, false)
            })
        );

        return (feeReceiver, kpiTokenInstance);
    }

    function testSuccessSingleReward() external {
        (, ERC20KPIToken kpiTokenInstance) = initializeKpiToken(false);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 1);

        Reward memory onChainReward = onChainRewards[0];

        assertEq(onChainReward.token, address(firstErc20));
        assertEq(onChainReward.amount, 10 ether);
        assertEq(onChainReward.minimumPayout, 1 ether);

        vm.clearMockedCalls();
    }

    function testSuccessMultipleReward() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10.1 ether);
        firstErc20.approve(address(kpiTokenInstance), 10.1 ether);

        secondErc20.mint(address(this), 3.03 ether);
        secondErc20.approve(address(kpiTokenInstance), 3.03 ether);

        Reward[] memory rewards = new Reward[](2);
        rewards[0] = Reward({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        rewards[1] = Reward({token: address(secondErc20), amount: 3 ether, minimumPayout: 2 ether});

        OracleData[] memory oracleData = new OracleData[](2);
        oracleData[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        oracleData[1] = OracleData({templateId: 1, weight: 3, value: 0, data: abi.encode("2")});
        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        address feeReceiver = address(42);
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(this),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: feeReceiver,
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 100 ether, false),
                oraclesData: abi.encode(oracleData, false)
            })
        );

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 2);

        assertEq(onChainRewards[0].token, address(firstErc20));
        assertEq(onChainRewards[0].amount, 10 ether);
        assertEq(onChainRewards[0].minimumPayout, 1 ether);

        assertEq(onChainRewards[1].token, address(secondErc20));
        assertEq(onChainRewards[1].amount, 3 ether);
        assertEq(onChainRewards[1].minimumPayout, 2 ether);

        vm.clearMockedCalls();
    }

    function testSuccessSingleRewardJustInTimeFunding() external {
        (address _feeReceiver, ERC20KPIToken kpiTokenInstance) = initializeKpiToken(true);

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(firstErc20.balanceOf(_feeReceiver), 0.1 ether);
        assertEq(onChainRewards.length, 1);

        Reward memory onChainReward = onChainRewards[0];
        assertEq(onChainReward.token, address(firstErc20));
        assertEq(onChainReward.amount, 10 ether);
        assertEq(onChainReward.minimumPayout, 1 ether);

        vm.clearMockedCalls();
    }

    function testSuccessMultipleRewardJustInTimeFunding() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10.1 ether);
        firstErc20.approve(address(kpiTokenInstance), 10.1 ether);

        secondErc20.mint(address(this), 3.03 ether);
        secondErc20.approve(address(kpiTokenInstance), 3.03 ether);

        Reward[] memory rewards = new Reward[](2);
        rewards[0] = Reward({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        rewards[1] = Reward({token: address(secondErc20), amount: 3 ether, minimumPayout: 2 ether});

        OracleData[] memory oracleData = new OracleData[](2);
        oracleData[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        oracleData[1] = OracleData({templateId: 1, weight: 3, value: 0, data: abi.encode("2")});
        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        IBaseTemplatesManager(kpiTokensManager).enableTemplateFeatureFor(1, JIT_FUNDING_FEATURE_ID, address(this));

        address feeReceiver = address(42);
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(this),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: feeReceiver,
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 100 ether, true),
                oraclesData: abi.encode(oracleData, false)
            })
        );

        (Reward[] memory onChainRewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        assertEq(onChainRewards.length, 2);

        assertEq(onChainRewards[0].token, address(firstErc20));
        assertEq(onChainRewards[0].amount, 10 ether);
        assertEq(onChainRewards[0].minimumPayout, 1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(firstErc20.balanceOf(feeReceiver), 0.1 ether);

        assertEq(onChainRewards[1].token, address(secondErc20));
        assertEq(onChainRewards[1].amount, 3 ether);
        assertEq(onChainRewards[1].minimumPayout, 2 ether);
        assertEq(secondErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(secondErc20.balanceOf(feeReceiver), 0.03 ether);

        vm.clearMockedCalls();
    }
}
