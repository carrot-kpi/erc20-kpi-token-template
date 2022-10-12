pragma solidity 0.8.17;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalize test
/// @dev Tests finalization in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenBelowLowerBoundFinalizeTest is BaseTestSetup {
    function testBelowLowerBoundAndRelationshipSingleOracleZeroMinimumPayout()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipSingleOracleNonZeroMinimumPayout()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1);
        assertEq(onChainCollaterals[0].minimumPayout, 1);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundOrRelationshipSingleOracleZeroMinimumPayout()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            false
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundOrRelationshipSingleOracleNonZeroMinimumPayout()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            false
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1);
        assertEq(onChainCollaterals[0].minimumPayout, 1);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipMultipleOraclesZeroMinimumPayout()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 20,
            higherBound: 26,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipMultipleOraclesBothOraclesFinalization()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 20,
            higherBound: 26,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            _predictedKpiTokenAddress
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);

        // second oracle finalization
        vm.prank(kpiTokenInstance.oracles()[1]);
        kpiTokenInstance.finalize(5);

        (onChainCollaterals, onChainFinalizableOracles, , , , ) = abi.decode(
            kpiTokenInstance.data(),
            (Collateral[], FinalizableOracle[], bool, uint256, string, string)
        );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(onChainFinalizableOracles[1].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipMultipleOraclesNonZeroMinimumPayout()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 20,
            higherBound: 26,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 1);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1);
        assertEq(onChainCollaterals[0].minimumPayout, 1);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipSingleOracleZeroMinimumPayoutMultiCollateral()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        _collaterals[1] = Collateral({
            token: address(secondErc20),
            amount: 4,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 4);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 4);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 0);
        assertEq(onChainCollaterals[1].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        _collaterals[1] = Collateral({
            token: address(secondErc20),
            amount: 7 ether,
            minimumPayout: 6 ether
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 7 ether);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 7 ether);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1);
        assertEq(onChainCollaterals[0].minimumPayout, 1);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 6 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 6 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundOrRelationshipSingleOracleZeroMinimumPayoutMultiCollateral()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        _collaterals[1] = Collateral({
            token: address(secondErc20),
            amount: 1 ether,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            false
        );

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 1 ether);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 1 ether);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 0);
        assertEq(onChainCollaterals[1].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundOrRelationshipSingleOracleNonZeroMinimumPayoutMultiCollateral()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        _collaterals[1] = Collateral({
            token: address(secondErc20),
            amount: 3.5 ether,
            minimumPayout: 1.2 ether
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            false
        );

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 3.5 ether);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 3.5 ether);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1);
        assertEq(onChainCollaterals[0].minimumPayout, 1);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 1.2 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 1.2 ether);

        assertEq(onChainFinalizableOracles.length, 1);
        assertTrue(onChainFinalizableOracles[0].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipMultipleOraclesZeroMinimumPayoutMultiCollateral()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 0
        });
        _collaterals[1] = Collateral({
            token: address(secondErc20),
            amount: 23 ether,
            minimumPayout: 0
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 20,
            higherBound: 26,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 23 ether);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 23 ether);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 0);
        assertEq(onChainCollaterals[0].minimumPayout, 0);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 0);
        assertEq(onChainCollaterals[1].minimumPayout, 0);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0);
    }

    function testBelowLowerBoundAndRelationshipMultipleOraclesNonZeroMinimumPayoutMultiCollateral()
        external
    {
        Collateral[] memory _collaterals = new Collateral[](2);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        _collaterals[1] = Collateral({
            token: address(secondErc20),
            amount: 40 ether,
            minimumPayout: 32.398938393 ether
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({
            templateId: 1,
            lowerBound: 10,
            higherBound: 11,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = OracleData({
            templateId: 1,
            lowerBound: 20,
            higherBound: 26,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            true
        );

        firstErc20.mint(address(this), 2);
        secondErc20.mint(address(this), 40 ether);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "a",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);
        secondErc20.approve(_predictedKpiTokenAddress, 40 ether);

        factory.createToken(
            1,
            "a",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address oracle = kpiTokenInstance.oracles()[0];
        vm.prank(oracle);
        kpiTokenInstance.finalize(5);

        (
            Collateral[] memory onChainCollaterals,
            FinalizableOracle[] memory onChainFinalizableOracles,
            ,
            ,
            ,

        ) = abi.decode(
                kpiTokenInstance.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(onChainCollaterals.length, 2);
        assertEq(onChainCollaterals[0].token, _collaterals[0].token);
        assertEq(onChainCollaterals[0].amount, 1);
        assertEq(onChainCollaterals[0].minimumPayout, 1);
        assertEq(onChainCollaterals[1].token, _collaterals[1].token);
        assertEq(onChainCollaterals[1].amount, 32.398938393 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 32.398938393 ether);

        assertEq(onChainFinalizableOracles.length, 2);
        assertTrue(onChainFinalizableOracles[0].finalized);
        assertTrue(!onChainFinalizableOracles[1].finalized);

        assertTrue(kpiTokenInstance.finalized());
        assertEq(firstErc20.balanceOf(address(this)), 0);
        assertEq(secondErc20.balanceOf(address(this)), 0 ether);
    }
}
