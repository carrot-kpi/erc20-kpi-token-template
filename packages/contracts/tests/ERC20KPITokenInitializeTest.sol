pragma solidity 0.8.17;

import {InitializeKPITokenParams} from "carrot/commons/Types.sol";
import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";
import {IOraclesManager1} from "carrot/interfaces/oracles-managers/IOraclesManager1.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token initialize test
/// @dev Tests initialization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenInitializeTest is BaseTestSetup {
    function testZeroAddressFeeReceiver() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(1), amount: 1, minimumPayout: 0});

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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 100 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testEmptyDescription() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        vm.expectRevert(abi.encodeWithSignature("InvalidDescription()"));
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
        vm.expectRevert(abi.encodeWithSignature("InvalidExpiration()"));
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
        vm.expectRevert(abi.encodeWithSignature("InvalidExpiration()"));
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

    function testTooManyCollaterals() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](6);
        for (uint8 i = 0; i < 6; i++) {
            collaterals[i] = Collateral({token: address(uint160(i)), amount: i, minimumPayout: 0});
        }

        vm.expectRevert(abi.encodeWithSignature("TooManyCollaterals()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testNoCollaterals() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](0);

        vm.expectRevert(abi.encodeWithSignature("NoCollaterals()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidName() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](5);
        for (uint8 i = 0; i < 5; i++) {
            collaterals[i] = Collateral({token: address(uint160(i)), amount: i, minimumPayout: 0});
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
                kpiTokenData: abi.encode(collaterals, true, "", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidSymbol() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](5);
        for (uint8 i = 0; i < 5; i++) {
            collaterals[i] = Collateral({token: address(uint160(i)), amount: i, minimumPayout: 0});
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testInvalidSupply() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](5);
        for (uint8 i = 0; i < 5; i++) {
            collaterals[i] = Collateral({token: address(uint160(i)), amount: i, minimumPayout: 0});
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 0 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testDuplicatedCollaterals() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](2);
        collaterals[0] = Collateral({token: address(10000), amount: 200, minimumPayout: 0});
        collaterals[1] = Collateral({token: address(10000), amount: 100, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("DuplicatedCollateral()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testZeroAddressCollateral() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(0), amount: 0, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("InvalidCollateral()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testZeroAmountCollateral() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(1), amount: 0, minimumPayout: 0});

        vm.expectRevert(abi.encodeWithSignature("InvalidCollateral()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testSameMinimumPayoutCollateral() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(1), amount: 1, minimumPayout: 1});

        vm.expectRevert(abi.encodeWithSignature("InvalidCollateral()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testGreaterMinimumPayoutCollateral() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(1), amount: 1, minimumPayout: 10});

        vm.expectRevert(abi.encodeWithSignature("InvalidCollateral()"));
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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 10 ether),
                oraclesData: abi.encode(uint256(1))
            })
        );
    }

    function testSuccess() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10 ether);
        firstErc20.approve(address(kpiTokenInstance), 10 ether);

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});

        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        OracleData[] memory oracleData = new OracleData[](1);
        oracleData[0] =
            OracleData({templateId: 1, lowerBound: 0, higherBound: 1, weight: 1, value: 0, data: abi.encode("")});

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
                kpiTokenData: abi.encode(collaterals, true, "Token", "TKN", 100 ether),
                oraclesData: abi.encode(oracleData, false)
            })
        );

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            bool onChainAndRelationship,
            uint256 onChainInitialSupply
        ) = abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, address(firstErc20));
        assertEq(onChainCollaterals[0].amount, 9.97 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 1 ether);
        assertEq(onChainFinalizableOracles.length, 1);
        assertEq(kpiTokenInstance.totalSupply(), 100 ether);
        assertEq(onChainInitialSupply, 100 ether);
        assertEq(kpiTokenInstance.owner(), address(this));
        assertEq(kpiTokenInstance.description(), "a");
        assertTrue(!onChainAndRelationship);
    }

    function testInitializationSuccess() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] =
            OracleData({templateId: 1, lowerBound: 10, higherBound: 11, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 110 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 3, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 110 ether);

        uint256 _expiration = block.timestamp + 3;
        factory.createToken(1, "a", _expiration, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        ERC20KPIToken _token = ERC20KPIToken(_predictedKpiTokenAddress);
        assertEq(_token.expiration(), _expiration);
    }

    function testInitializationSuccessWithValue() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 110 ether, minimumPayout: 0});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, true, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 10 ether,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, true);

        firstErc20.mint(address(this), 110 ether);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "a", block.timestamp + 3, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 110 ether);

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
