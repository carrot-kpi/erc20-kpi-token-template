pragma solidity 0.8.23;

import {InitializeKPITokenParams} from "carrot/commons/Types.sol";
import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken, JIT_FUNDING_FEATURE_ID} from "../src/ERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Reward, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";
import {IBaseTemplatesManager} from "carrot/interfaces/IBaseTemplatesManager.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token initialize test
/// @dev Tests initialization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenInitializeTest is BaseTestSetup {
    function testZeroAddressFeeReceiver() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(1), amount: 1, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("InvalidFeeReceiver()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(0),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 100 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testEmptyDescription() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        vm.expectRevert();
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(uint256(1)),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testPresentBlockTimeExpiration() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert();
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp,
                kpiTokenData: abi.encode(uint256(1)),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testPastBlockTimeExpiration() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.warp(10);
        vm.expectRevert();
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp - 5,
                kpiTokenData: abi.encode(uint256(1)),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidData() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert();
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 10,
                kpiTokenData: abi.encode(uint256(1)),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testTooManyRewards() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](6);
        for (uint8 i = 0; i < 6; i++) {
            rewards[i] = Reward({token: address(uint160(i)), amount: i, minimumPayout: 0});
        }

        vm.expectRevert(abi.encodeWithSignature("TooManyRewards()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testNoRewards() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](0);

        vm.expectRevert(abi.encodeWithSignature("NoRewards()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidName() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](5);
        for (uint8 i = 0; i < 5; i++) {
            rewards[i] = Reward({token: address(uint160(i)), amount: i, minimumPayout: 0});
        }

        vm.expectRevert(abi.encodeWithSignature("InvalidName()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidSymbol() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](5);
        for (uint8 i = 0; i < 5; i++) {
            rewards[i] = Reward({token: address(uint160(i)), amount: i, minimumPayout: 0});
        }

        vm.expectRevert(abi.encodeWithSignature("InvalidSymbol()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidSupply() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](5);
        for (uint8 i = 0; i < 5; i++) {
            rewards[i] = Reward({token: address(uint160(i)), amount: i, minimumPayout: 0});
        }

        vm.expectRevert(abi.encodeWithSignature("InvalidTotalSupply()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 0 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testDuplicatedRewards() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](2);
        rewards[0] = Reward({token: address(10000), amount: 200, minimumPayout: 0});
        rewards[1] = Reward({token: address(10000), amount: 100, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("DuplicatedReward()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testZeroAddressReward() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(0), amount: 0, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("InvalidReward()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testZeroAmountReward() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(1), amount: 0, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("InvalidReward()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testSameMinimumPayoutReward() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(1), amount: 1, minimumPayout: 1});

        vm.expectRevert(abi.encodeWithSignature("InvalidReward()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testGreaterMinimumPayoutReward() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(1), amount: 1, minimumPayout: 10});

        vm.expectRevert(abi.encodeWithSignature("InvalidReward()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(1),
                oraclesManager: address(1),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(rewards, "Token", "TKN", 10 ether, false),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testSuccess() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10.1 ether);
        firstErc20.approve(address(kpiTokenInstance), 10.1 ether);

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});

        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        OracleData[] memory oracleData = new OracleData[](1);
        oracleData[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});

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

        (
            Reward[] memory onChainRewards,
            FinalizableOracle[] memory onChainFinalizableOracles,
            bool onChainAndRelationship,
            bool onChainJitFunding,
            uint256 onChainInitialSupply
        ) = abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].token, address(firstErc20));
        assertEq(onChainRewards[0].amount, 10 ether);
        assertEq(onChainRewards[0].minimumPayout, 1 ether);
        assertEq(onChainFinalizableOracles.length, 1);
        assertEq(kpiTokenInstance.totalSupply(), 100 ether);
        assertEq(onChainInitialSupply, 100 ether);
        assertEq(kpiTokenInstance.owner(), address(this));
        assertEq(kpiTokenInstance.description(), "a");
        assertTrue(!onChainAndRelationship);
    }

    function testSuccessWithJustInTimeFunding() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 0.1 ether);
        firstErc20.approve(address(kpiTokenInstance), 0.1 ether);

        Reward[] memory rewards = new Reward[](1);
        rewards[0] = Reward({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});

        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        OracleData[] memory oracleData = new OracleData[](1);
        oracleData[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});

        IBaseTemplatesManager(kpiTokensManager).enableTemplateFeatureFor(1, JIT_FUNDING_FEATURE_ID, address(this));

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

        (
            Reward[] memory onChainRewards,
            FinalizableOracle[] memory onChainFinalizableOracles,
            bool onChainAndRelationship,
            bool onChainJitFunding,
            uint256 onChainInitialSupply
        ) = abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, bool, uint256));

        assertEq(onChainRewards.length, 1);
        assertEq(onChainRewards[0].token, address(firstErc20));
        assertEq(onChainRewards[0].amount, 10 ether);
        assertEq(onChainRewards[0].minimumPayout, 1 ether);
        assertEq(firstErc20.balanceOf(address(kpiTokenInstance)), 0);
        assertEq(firstErc20.balanceOf(feeReceiver), 0.1 ether);
        assertEq(onChainFinalizableOracles.length, 1);
        assertEq(kpiTokenInstance.totalSupply(), 100 ether);
        assertEq(onChainInitialSupply, 100 ether);
        assertEq(kpiTokenInstance.owner(), address(this));
        assertEq(kpiTokenInstance.description(), "a");
        assertTrue(!onChainAndRelationship);
    }

    function testInitializationSuccess() external {
        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 3, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        uint256 _expiration = block.timestamp + 3;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken _token = ERC20KPIToken(_predictedKpiTokenAddress);
        assertEq(_token.expiration(), _expiration);
    }

    function testInitializationSuccessWithValue() external {
        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_rewards, "Test", "TST", 100 ether, false);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 10 ether, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 111.1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 3, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 111.1 ether);

        vm.deal(address(this), 10 ether);

        uint256 _expiration = block.timestamp + 3;
        factory.createToken{value: 10 ether}(
            1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );

        ERC20KPIToken _token = ERC20KPIToken(_predictedKpiTokenAddress);
        assertEq(_token.expiration(), _expiration);

        assertEq((_token.oracles()[0]).balance, 10 ether);
    }
}
